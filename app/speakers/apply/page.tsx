'use client';

import { useState, useRef } from 'react';
import { submitSpeakerApplication } from './actions';
import { ChevronLeft, ArrowRight, CheckCircle2, AlertCircle, Upload, ImageIcon, X } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { compressImage } from '@/utils/imageCompression';

export default function SpeakerApplyPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image est trop volumineuse (max 5MB)');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  async function uploadProfileImage(applicationId: string): Promise<string | null> {
    if (!imageFile) return null;
    const supabase = createClient();
    
    // Compress profile image to JPEG at 0.82 quality, max 1600px
    const compressedFile = await compressImage(imageFile, 1600, 0.82);
    const filePath = `${applicationId}/profile.jpg`;
    
    const { error: uploadError } = await supabase.storage
      .from('speakers')
      .upload(filePath, compressedFile, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('speakers').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await submitSpeakerApplication(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Upload image if selected
      if (imageFile && result.id) {
        const imageUrl = await uploadProfileImage(result.id);
        if (imageUrl) {
          const supabase = createClient();
          await supabase
            .from('speaker_applications')
            .update({ profile_image: imageUrl })
            .eq('id', result.id);
        }
      }
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-[calc(100dvh-72px)] flex items-center justify-center p-md bg-[var(--gradient-hero)]">
        <div className="glass-strong animate-fade-in-up w-full max-w-[480px] p-lg md:p-xl rounded-2xl text-center">
          <div className="w-16 h-16 bg-emerald-500/10 border border-[var(--brand-success)] rounded-full flex items-center justify-center mx-auto mb-lg">
            <CheckCircle2 size={32} className="text-[var(--brand-success)]" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold mb-md">Candidature Envoyée !</h1>
          <p className="text-[var(--text-secondary)] text-sm md:text-base mb-xl leading-relaxed">
            Merci de votre intérêt pour Ayibuzz Media. Notre équipe examinera votre profil et vous contactera par email très prochainement.
          </p>
          <Link href="/speakers" className="btn-primary no-underline inline-flex items-center gap-sm">
            Retour aux intervenants <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pt-2xl md:pt-3xl pb-2xl md:pb-3xl bg-[var(--gradient-hero)]">
      <div className="max-w-[640px] mx-auto px-md md:px-lg">
        <Link href="/speakers" className="inline-flex items-center gap-xs text-[var(--text-muted)] no-underline mb-xl text-sm font-semibold hover:text-[var(--text-primary)] transition-colors">
          <ChevronLeft size={16} /> Retour
        </Link>

        <div className="mb-xl">
          <div className="badge badge-primary mb-md inline-flex">Devenir Intervenant</div>
          <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight mb-md leading-[1.1]">
            Partagez votre <span className="text-[var(--brand-accent)]">vision</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed">
            Vous avez une histoire inspirante ou une expertise à partager avec la jeunesse haïtienne ? Remplissez ce formulaire pour postuler.
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-lg md:p-xl border border-[var(--border-default)]">
          <form onSubmit={handleSubmit} className="grid gap-lg">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-[var(--brand-danger)] flex items-center gap-sm text-sm font-semibold">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div>
                <label className="block text-xs md:text-sm font-semibold mb-2 text-[var(--text-secondary)]">Nom Complet</label>
                <input required name="full_name" type="text" className="input-field" placeholder="ex: Jean Pierre" />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-semibold mb-2 text-[var(--text-secondary)]">Email Professionnel</label>
                <input required name="email" type="email" className="input-field" placeholder="ex: jean@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-semibold mb-2 text-[var(--text-secondary)]">Rôle ou Titre</label>
              <input required name="role" type="text" className="input-field" placeholder="ex: Entrepreneur, Expert en Tech..." />
            </div>

            {/* Photo Upload Area */}
            <div className="bg-slate-900/2 rounded-2xl p-md border border-[var(--border-subtle)]">
              <label className="block text-xs md:text-sm font-semibold mb-3 text-[var(--text-secondary)]">Photo de profil (Recommandé)</label>
              
              <div className="flex items-center gap-md">
                {imagePreview ? (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-3 border-[var(--brand-accent)] shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-1 right-1 bg-red-500/90 text-white border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer shadow-sm hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[rgba(14,26,212,0.05)] border-2 border-dashed border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                    <ImageIcon size={32} strokeWidth={1.5} />
                  </div>
                )}

                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border-2 border-dashed border-[var(--border-default)] rounded-xl p-5 flex flex-col items-center gap-0.5 cursor-pointer bg-slate-900/2 hover:border-[var(--brand-accent)] hover:bg-[rgba(14,26,212,0.04)] transition-all"
                >
                  <Upload size={18} className="text-[var(--brand-accent)]" />
                  <p className="font-semibold text-xs md:text-sm">Cliquez ou glissez une photo</p>
                  <p className="text-[10px] md:text-xs text-[var(--text-muted)]">JPG, PNG, WebP (Max 5MB)</p>
                </div>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-semibold mb-2 text-[var(--text-secondary)]">Bio / Présentation</label>
              <textarea required name="bio" rows={4} className="input-field h-auto" placeholder="Parlez-nous de vous et de ce que vous souhaitez partager..." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div>
                <label className="block text-xs md:text-sm font-semibold mb-2 text-[var(--text-secondary)]">Linkedin (Optionnel)</label>
                <input name="linkedin_url" type="url" className="input-field" placeholder="https://linkedin.com/..." />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-semibold mb-2 text-[var(--text-secondary)]">Twitter / X (Optionnel)</label>
                <input name="twitter_handle" type="text" className="input-field" placeholder="@votrecompte" />
              </div>
            </div>

            <div className="pt-4">
              <button disabled={loading} type="submit" className="btn-primary w-full flex items-center justify-center gap-sm py-4 text-base" style={{ cursor: loading ? 'wait' : 'pointer' }}>
                {loading ? 'Soumission...' : 'Envoyer ma candidature'} <ArrowRight size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
