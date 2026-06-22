'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';

// Interface décrivant un Sponsor pour le typage TypeScript
export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  logo_url: string;
  websiteUrl: string | null;
  website_url: string | null;
  isActive: boolean;
  is_active: boolean;
  createdAt: string;
  created_at: string;
}

// Fonction de mapping pour supporter à la fois camelCase (standard Prisma) et snake_case (standard PostgreSQL/Supabase)
function mapSponsor(s: any): Sponsor {
  return {
    id: s.id,
    name: s.name,
    logoUrl: s.logo_url,
    logo_url: s.logo_url,
    websiteUrl: s.website_url,
    website_url: s.website_url,
    isActive: s.is_active,
    is_active: s.is_active,
    createdAt: s.created_at,
    created_at: s.created_at,
  };
}

// Fonction d'aide pour vérifier si l'utilisateur connecté possède les droits d'administrateur
async function verifyAdmin() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  
  const isSystemAdmin = 
    session.user.email?.toLowerCase() === 'admin@uplift.io' || 
    session.user.user_metadata?.role === 'admin';
  return isSystemAdmin;
}

// Fonction d'aide pour obtenir le client Supabase avec les droits de service (outrepasse RLS)
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Récupère tous les sponsors (pour le tableau de bord d'administration)
export async function getAllSponsors() {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors du chargement des sponsors:', error);
    return { error: 'Erreur lors du chargement des sponsors.' };
  }

  return { data: (data || []).map(mapSponsor) };
}

// Alias de getAllSponsors pour compatibilité avec l'interface d'administration existante
export const getSponsors = getAllSponsors;

// Bascule le statut actif/inactif d'un sponsor (Administrateurs uniquement)
export async function toggleSponsorActive(id: string, currentStatus: boolean) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { error: 'Non autorisé' };
  }

  const supabase = getServiceClient();
  const { error } = await supabase
    .from('sponsors')
    .update({ is_active: !currentStatus })
    .eq('id', id);

  if (error) {
    console.error('Erreur lors du changement de statut du sponsor:', error);
    return { error: 'Erreur lors du changement de statut.' };
  }

  // Revalidation du cache Next.js
  revalidatePath('/admin/sponsors');
  revalidatePath('/');
  revalidateTag('active-sponsors', 'default');
  revalidateTag('sponsors', 'default');

  return { success: true };
}


// Crée un nouveau sponsor (Administrateurs uniquement)
export async function createSponsor(data: {
  name: string;
  logoUrl?: string;
  logo_url?: string;
  websiteUrl?: string;
  website_url?: string;
  isActive?: boolean;
  is_active?: boolean;
}) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { error: 'Non autorisé' };
  }

  const name = data.name;
  const logo_url = data.logoUrl || data.logo_url;
  const website_url = data.websiteUrl || data.website_url || '';
  const is_active = data.isActive !== undefined ? data.isActive : (data.is_active !== undefined ? data.is_active : true);

  if (!name || !name.trim()) {
    return { error: 'Le nom du sponsor est obligatoire.' };
  }
  if (!logo_url || !logo_url.trim()) {
    return { error: 'Le logo du sponsor est obligatoire.' };
  }

  const supabase = getServiceClient();
  const { data: sponsor, error } = await supabase
    .from('sponsors')
    .insert([
      {
        name: name.trim(),
        logo_url: logo_url.trim(),
        website_url: website_url.trim() || null,
        is_active,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la création du sponsor:', error);
    return { error: 'Erreur lors de la création du sponsor.' };
  }

  // Revalidation du cache Next.js
  revalidatePath('/admin/sponsors');
  revalidatePath('/');
  revalidateTag('active-sponsors', 'default');
  revalidateTag('sponsors', 'default');

  return { success: true, data: mapSponsor(sponsor) };
}

// Met à jour un sponsor existant (Administrateurs uniquement)
export async function updateSponsor(
  id: string,
  data: {
    name: string;
    logoUrl?: string;
    logo_url?: string;
    websiteUrl?: string;
    website_url?: string;
    isActive?: boolean;
    is_active?: boolean;
  }
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { error: 'Non autorisé' };
  }

  const name = data.name;
  const logo_url = data.logoUrl || data.logo_url;
  const website_url = data.websiteUrl || data.website_url || '';
  const is_active = data.isActive !== undefined ? data.isActive : (data.is_active !== undefined ? data.is_active : true);

  if (!name || !name.trim()) {
    return { error: 'Le nom du sponsor est obligatoire.' };
  }
  if (!logo_url || !logo_url.trim()) {
    return { error: 'Le logo du sponsor est obligatoire.' };
  }

  const supabase = getServiceClient();
  const { data: sponsor, error } = await supabase
    .from('sponsors')
    .update({
      name: name.trim(),
      logo_url: logo_url.trim(),
      website_url: website_url.trim() || null,
      is_active,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la mise à jour du sponsor:', error);
    return { error: 'Erreur lors de la mise à jour du sponsor.' };
  }

  // Revalidation du cache Next.js
  revalidatePath('/admin/sponsors');
  revalidatePath('/');
  revalidateTag('active-sponsors', 'default');
  revalidateTag('sponsors', 'default');

  return { success: true, data: mapSponsor(sponsor) };
}

// Supprime un sponsor (Administrateurs uniquement)
export async function deleteSponsor(id: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { error: 'Non autorisé' };
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from('sponsors').delete().eq('id', id);

  if (error) {
    console.error('Erreur lors de la suppression du sponsor:', error);
    return { error: 'Erreur lors de la suppression du sponsor.' };
  }

  // Revalidation du cache Next.js
  revalidatePath('/admin/sponsors');
  revalidatePath('/');
  revalidateTag('active-sponsors', 'default');
  revalidateTag('sponsors', 'default');

  return { success: true };
}

// Récupère uniquement les sponsors actifs avec mise en cache des données (Server Cache)
export const getActiveSponsors = unstable_cache(
  async () => {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors du chargement des sponsors actifs:', error);
      return [];
    }

    return (data || []).map(mapSponsor);
  },
  ['active-sponsors-cache-key'],
  {
    revalidate: 3600, // Mise en cache pour 1 heure (3600 secondes)
    tags: ['sponsors', 'active-sponsors']
  }
);
