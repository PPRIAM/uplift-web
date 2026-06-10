'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateApplicationStatus(id: string, status: 'approved' | 'rejected') {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('speaker_applications')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating status:', error);
    return { error: 'Erreur lors de la mise à jour du statut.' };
  }

  revalidatePath('/admin/speaker-applications');
  return { success: true };
}

export async function promoteToSpeaker(applicationId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Get the application details
  const { data: application, error: fetchError } = await supabase
    .from('speaker_applications')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (fetchError || !application) {
    return { error: "Impossible de trouver la candidature." };
  }

  // 1b. Check if already approved
  if (application.status === 'approved') {
    return { error: "Cette candidature a déjà été approuvée." };
  }

  // 1c. Check if a speaker with the same name or email already exists
  const { data: existingSpeaker } = await supabase
    .from('speakers')
    .select('id')
    .eq('full_name', application.full_name)
    .single();

  if (existingSpeaker) {
     // If speaker exists, just update the application status to approved but don't insert duplicate speaker
     await supabase
      .from('speaker_applications')
      .update({ status: 'approved' })
      .eq('id', applicationId);
     
     revalidatePath('/admin/speaker-applications');
     return { success: true, message: "L'intervenant existait déjà. Le statut a été mis à jour." };
  }

  // 2. Insert into speakers table
  const { error: insertError } = await supabase
    .from('speakers')
    .insert([{
      full_name: application.full_name,
      role: application.role,
      bio: application.bio,
      twitter_handle: application.twitter_handle,
      linkedin_url: application.linkedin_url,
      profile_image: application.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(application.full_name)}`,
      published: false,
      application_id: applicationId
    }]);

  if (insertError) {
    console.error('Error promoting to speaker:', insertError);
    return { error: "Erreur lors de la création du profil intervenant." };
  }

  // 3. Update application status
  const { error: statusError } = await supabase
    .from('speaker_applications')
    .update({ status: 'approved', published: false })
    .eq('id', applicationId);

  if (statusError) {
    console.error('Error updating status at end of promotion:', statusError);
    return { error: "L'intervenant a été créé, mais le statut de la candidature n'a pas pu être mis à jour." };
  }

  revalidatePath('/admin/speaker-applications');
  revalidatePath('/admin/speakers');
  revalidatePath('/speakers');

  return { success: true };
}

export async function toggleApplicationVisibility(id: string, published: boolean) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('speaker_applications')
    .update({ published })
    .eq('id', id);

  if (error) {
    console.error('Error toggling visibility:', error);
    return { error: "Erreur lors du changement de visibilité." };
  }

  revalidatePath('/admin/speaker-applications');
  revalidatePath('/speakers');
  return { success: true };
}

export async function toggleSpeakerVisibility(id: string, published: boolean) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('speakers')
    .update({ published })
    .eq('id', id);

  if (error) {
    console.error('Error toggling speaker visibility:', error);
    return { error: "Erreur lors du changement de visibilité." };
  }

  revalidatePath('/admin/speakers');
  revalidatePath('/speakers');
  return { success: true };
}

export async function deleteApplication(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('speaker_applications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting application:', error);
    return { error: "Erreur lors de la suppression." };
  }

  revalidatePath('/admin/speaker-applications');
  return { success: true };
}
