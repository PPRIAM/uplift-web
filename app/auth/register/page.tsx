'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { createClient } from '@/utils/supabase/client';
import { ArrowRight, User, Mail, Lock, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'details' | 'code'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    const supabase = createClient();
    
    // 1. Sign up the user
    let { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          name: form.name.trim(),
          role: 'attendee',
          verified: false
        }
      }
    });

    // Handle existing unverified user (Resume Registration)
    if (signUpError && (signUpError.message.toLowerCase().includes('already registered') || signUpError.status === 422)) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (!signInError && signInData.user) {
        if (signInData.user.user_metadata?.verified === true) {
          setError('Cet e-mail est déjà utilisé. Veuillez vous connecter.');
          setLoading(false);
          return;
        }
        // Resume with existing user
        signUpData = signInData;
        signUpError = null;
      } else {
        setError('Cet e-mail est déjà utilisé.');
        setLoading(false);
        return;
      }
    }

    if (signUpError) {
      setError(signUpError.message || 'Erreur lors de l\'inscription.');
      setLoading(false);
      return;
    }

    const user = signUpData.user;
    if (!user) {
      setError('Impossible de créer le compte.');
      setLoading(false);
      return;
    }

    // 2. Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Update user metadata with the code
    const { error: updateError } = await supabase.auth.updateUser({
      data: { temp_code: verificationCode }
    });

    if (updateError) {
      setError('Erreur lors de la préparation de la vérification.');
      setLoading(false);
      return;
    }

    // 4. Send the code via Resend (using internal API route)
    try {
      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Votre code de vérification Ayibuzz Media',
          to_emails: [form.email.trim()],
          from_name: 'Ayibuzz Media',
          from_email: 'contact@ayibuzz-media.com',
          send_now: true,
          html_body: `
            <div style="font-family: sans-serif; padding: 40px; background: #f9fafb; border-radius: 16px; border: 1px solid #e5e7eb; max-width: 500px; margin: 0 auto;">
              <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 8px; text-align: center;">Vérifiez votre compte</h1>
              <p style="color: #6b7280; font-size: 16px; text-align: center; margin-bottom: 32px;">Utilisez le code suivant pour finaliser votre inscription sur Ayibuzz Media.</p>
              <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
                <span style="font-size: 42px; font-weight: 900; letter-spacing: 0.2em; color: #6366f1;">${verificationCode}</span>
              </div>
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">Ce code expirera dans 15 minutes.</p>
            </div>
          `
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'e-mail.');
      }

      setStep('code');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du code par e-mail.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError('');
    setLoading(true);

    const supabase = createClient();
    
    // 1. Get current user metadata
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      setError('Session expirée. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    const expectedCode = userData.user.user_metadata?.temp_code;

    if (code.trim() === expectedCode) {
      // 2. Mark as verified and clear temp code
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          verified: true,
          temp_code: null
        }
      });

      if (updateError) {
        setError('Erreur lors de la confirmation du compte.');
        setLoading(false);
      } else {
        const user = userData.user;
        const isSystemAdmin = user.email?.toLowerCase() === 'admin@uplift.io' || user.user_metadata?.role === 'admin';
        const name = user.user_metadata?.name || user.email?.split('@')[0] || '';
        
        login({ 
          id: user.id, 
          name, 
          email: user.email || form.email.trim(), 
          role: isSystemAdmin ? 'admin' : 'attendee' 
        });
        
        if (isSystemAdmin) {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    } else {
      setError('Code de vérification incorrect.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-72px)] flex items-center justify-center p-md md:p-lg bg-[var(--gradient-hero)] relative">
      <div className="orb w-[500px] h-[500px] bg-[rgba(14,26,212,0.06)] -top-[100px] -left-[100px]" />

      <div className="glass-strong animate-fade-in rounded-2xl p-lg md:p-xl w-full max-w-[440px] relative z-[1]">
        <div className="text-center mb-xl">
          <img src="/logo-ayibuzz.png" alt="Ayibuzz Media" className="h-14 w-auto mb-lg mx-auto object-contain" />
          <h1 className="font-display text-2xl font-extrabold mb-1.5 text-[var(--text-primary)]">Rejoignez Ayibuzz Media</h1>
          <p className="text-[var(--text-muted)] text-sm">
            {step === 'details' ? 'Créez votre compte pour réserver des billets' : `Saisissez le code envoyé à ${form.email}`}
          </p>
        </div>

        {step === 'details' ? (
          <form onSubmit={handleSendOtp}>
            <div className="mb-md">
              <label className="block text-xs md:text-sm font-semibold text-[var(--text-secondary)] mb-2">Nom complet</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input 
                  type="text" 
                  placeholder="Kofi Mensah" 
                  className="input-field pl-[40px]" 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  required 
                />
              </div>
            </div>

            <div className="mb-md">
              <label className="block text-xs md:text-sm font-semibold text-[var(--text-secondary)] mb-2">Adresse e-mail</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input 
                  type="email" 
                  placeholder="vous@exemple.com" 
                  className="input-field pl-[40px]" 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                  required 
                />
              </div>
            </div>

            <div className="mb-md">
              <label className="block text-xs md:text-sm font-semibold text-[var(--text-secondary)] mb-2">Mot de passe</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="input-field pl-[40px]" 
                  value={form.password} 
                  onChange={e => setForm({ ...form, password: e.target.value })} 
                  required 
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-sm p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-[var(--brand-danger)] text-xs md:text-sm mb-md">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full flex justify-center items-center gap-sm py-3.5 no-underline" disabled={loading}>
              {loading ? 'Envoi du code...' : 'Créer un compte'} {!loading && <ArrowRight size={16} />}
            </button>
          </form>

        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-lg">
              <label className="block text-xs md:text-sm font-semibold text-[var(--text-secondary)] mb-2">Code de vérification</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Ex: 123456"
                className="input-field text-center tracking-widest text-lg font-bold"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-sm p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-[var(--brand-danger)] text-xs md:text-sm mb-md">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full flex justify-center items-center gap-sm py-3.5 no-underline" disabled={loading}>
              {loading ? 'Vérification...' : 'Valider le code'} <ArrowRight size={16} />
            </button>
            
            <button 
              type="button" 
              onClick={() => { setStep('details'); setError(''); }}
              className="w-full bg-transparent border-none text-[var(--text-muted)] text-xs md:text-sm mt-md cursor-pointer hover:underline"
            >
              Modifier mes informations
            </button>
          </form>
        )}

        <p className="text-center mt-md text-xs text-[var(--text-muted)] leading-relaxed">
          En créant un compte, vous acceptez nos{' '}
          <Link href="/terms" className="text-[var(--brand-accent)] hover:underline no-underline">Conditions d'utilisation</Link> et{' '}
          <Link href="/privacy" className="text-[var(--brand-accent)] hover:underline no-underline">Politique de confidentialité</Link>
        </p>

        <p className="text-center mt-md text-sm text-[var(--text-muted)]">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="text-[var(--brand-accent)] font-semibold hover:underline no-underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
