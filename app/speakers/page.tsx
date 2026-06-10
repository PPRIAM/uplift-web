import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import SpeakersClient from './SpeakersClient';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Voix & Créateurs',
  description: "Découvre les créateurs, experts et leaders d'opinion qui partagent leur vision sur Ayibuzz Media.",
};

export const revalidate = 3600;

export default async function SpeakersPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const [speakersRes, appsRes] = await Promise.all([
    supabase
      .from('speakers')
      .select('id, full_name, role, bio, profile_image, published, company, twitter_handle, linkedin_url')
      .eq('published', true)
      .order('full_name'),
    supabase
      .from('speaker_applications')
      .select('id, full_name, role, bio, status, published, twitter_handle, linkedin_url')
      .eq('status', 'approved')
      .eq('published', true)
  ]);

  const directSpeakers = speakersRes.data;
  const approvedApps = appsRes.data;
  
  const allSpeakersMap = new Map();

  (directSpeakers || []).forEach(s => {
    allSpeakersMap.set(s.full_name.toLowerCase(), {
      id: s.id,
      name: s.full_name,
      title: s.role,
      company: s.company || '',
      bio: s.bio || '',
      avatar: s.profile_image || '',
      twitter: s.twitter_handle || '',
      linkedin: s.linkedin_url || ''
    });
  });

  (approvedApps || []).forEach(a => {
    if (!allSpeakersMap.has(a.full_name.toLowerCase())) {
      allSpeakersMap.set(a.full_name.toLowerCase(), {
        id: a.id,
        name: a.full_name,
        title: a.role,
        company: '',
        bio: a.bio || '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(a.full_name)}`,
        twitter: a.twitter_handle || '',
        linkedin: a.linkedin_url || ''
      });
    }
  });

  const speakers = Array.from(allSpeakersMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="pb-2xl md:pb-3xl">
      <SpeakersClient initialSpeakers={speakers} />

      {/* CTA Section (Static) */}
      <section className="max-w-[1200px] mx-auto mt-2xl md:mt-3xl px-md md:px-lg">
        <div className="card p-xl md:p-2xl text-center relative overflow-hidden bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <div className="orb -top-[100px] -right-[100px] w-[300px] h-[300px] bg-[rgba(14,26,212,0.08)]" />
          <h2 className="font-display text-2xl md:text-4xl font-extrabold mb-md relative">
            Tu veux <span className="text-[var(--brand-accent)]">partager ta voix</span> ?
          </h2>
          <p className="text-[var(--text-secondary)] text-sm md:text-base max-w-[600px] mx-auto mb-xl relative leading-relaxed">
            L&apos;appel à créateurs et intervenants est ouvert. Nous recherchons des histoires inspirantes et des expertises uniques.
          </p>
          <Link href="/speakers/apply" className="btn-primary no-underline py-3.5 px-8 relative inline-flex items-center gap-sm">
            Soumettre ma candidature <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
