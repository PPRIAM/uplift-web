'use server';

import { getSupabaseAdmin } from '@/utils/supabase/admin';
import { z } from 'zod';

const SpeakerApplicationSchema = z.object({
  full_name: z.string().min(3, 'Le nom doit comporter au moins 3 caractères'),
  email: z.string().email('Email invalide'),
  role: z.string().min(3, 'Le titre doit comporter au moins 3 caractères'),
  bio: z.string().min(10, 'La biographie doit comporter au moins 10 caractères'),
  twitter_handle: z.string().optional(),
  linkedin_url: z.string().optional(),
});

export async function submitSpeakerApplication(formData: FormData) {
  const diagnosticId = 'err_' + Math.random().toString(36).substring(2, 10);

  try {
    const rawData = {
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      role: formData.get('role'),
      bio: formData.get('bio'),
      twitter_handle: formData.get('twitter_handle'),
      linkedin_url: formData.get('linkedin_url'),
    };

    const validation = SpeakerApplicationSchema.safeParse(rawData);

    if (!validation.success) {
      const validationMessage = validation.error.issues.map(i => i.message).join(', ');
      return { 
        success: false,
        error: 'Validation échouée : ' + validationMessage,
        diagnosticId 
      };
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error: dbError } = await supabaseAdmin
      .from('speaker_applications')
      .insert([validation.data])
      .select()
      .single();

    if (dbError) {
      console.error(`[SpeakerApply] Database Insert Error [${diagnosticId}]:`, {
        message: dbError.message,
        code: dbError.code,
        details: dbError.details,
        hint: dbError.hint,
        email: validation.data.email,
      });
      return {
        success: false,
        error: 'Une erreur technique est survenue lors de la soumission de votre candidature. Veuillez réessayer plus tard.',
        diagnosticId,
      };
    }

    // Process file upload on the server if present
    const imageFile = formData.get('profile_image') as File | null;
    let publicUrl: string | null = null;

    if (imageFile && imageFile.size > 0) {
      try {
        if (!imageFile.type.startsWith('image/')) {
          throw new Error('Type de fichier non supporté. Seules les images sont acceptées.');
        }
        if (imageFile.size > 5 * 1024 * 1024) {
          throw new Error('L\'image est trop volumineuse (max 5MB)');
        }

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filePath = `${data.id}/profile.jpg`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('speakers')
          .upload(filePath, buffer, {
            contentType: imageFile.type,
            upsert: true,
            duplex: 'half',
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabaseAdmin.storage.from('speakers').getPublicUrl(filePath);
        publicUrl = publicUrlData.publicUrl;

        const { error: updateError } = await supabaseAdmin
          .from('speaker_applications')
          .update({ profile_image: publicUrl })
          .eq('id', data.id);

        if (updateError) {
          throw updateError;
        }
      } catch (err: any) {
        console.error(`[SpeakerApply] Image Upload/Update Error [${diagnosticId}]:`, {
          message: err.message || err,
          stack: err.stack,
          applicationId: data.id,
        });
        // We make this non-blocking so the user still succeeds even if the image upload failed.
      }
    }

    return { success: true, id: data.id };
  } catch (err: any) {
    console.error(`[SpeakerApply] Uncaught Exception [${diagnosticId}]:`, {
      message: err.message || err,
      stack: err.stack,
    });
    return {
      success: false,
      error: 'Une erreur technique est survenue lors de la soumission de votre candidature. Veuillez réessayer plus tard.',
      diagnosticId,
    };
  }
}

