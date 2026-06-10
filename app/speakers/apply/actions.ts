'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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
    return { error: 'Validation échouée : ' + validation.error.issues[0].message };
  }

  const { data, error } = await supabase
    .from('speaker_applications')
    .insert([validation.data])
    .select()
    .single();

  if (error) {
    console.error('Submission error:', error);
    return { error: 'Une erreur est survenue lors de la soumission. Veuillez réessayer.' };
  }

  return { success: true, id: data.id };
}
