'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { createClient } from '@/utils/supabase/client';
import { ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100dvh-72px)] flex items-center justify-center bg-[var(--gradient-hero)]">
        <div className="w-10 h-10 rounded-full border-3 border-[var(--border-subtle)] border-t-[var(--brand-accent)] animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setError('');
    setLoading(true);

    const supabase = createClient();
    
    // 1. Verify Password
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (signInError) {
      setError(signInError.message || 'Email ou mot de passe incorrect.');
      setLoading(false);
      return;
    }

    const user = signInData.user;
    if (!user) {
      setError('Impossible de se connecter.');
      setLoading(false);
      return;
    }

    // 2. Check Verification Status
    if (user.user_metadata?.verified === false) {
      setError('Votre compte n\'est pas encore vérifié. Veuillez retourner à l\'inscription.');
      setLoading(false);
      return;
    }

    // 3. Login successfully
    const isSystemAdmin = user.email?.toLowerCase() === 'admin@uplift.io' || user.user_metadata?.role === 'admin';
    const name = user.user_metadata?.name || user.email?.split('@')[0] || '';
    
    login({ 
      id: user.id, 
      name, 
      email: user.email || email.trim(), 
      role: isSystemAdmin ? 'admin' : 'attendee' 
    });
    
    if (isSystemAdmin) {
      router.push('/admin');
    } else {
      router.push(redirectTo || '/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100dvh-72px)] flex items-center justify-center p-md md:p-lg bg-[var(--gradient-hero)] relative">
      <div className="orb w-[500px] h-[500px] bg-[rgba(14,26,212,0.06)] -top-[100px] -right-[100px]" />
      <div className="orb w-[300px] h-[300px] bg-[rgba(14,26,212,0.04)] -bottom-[50px] -left-[50px]" />

      <div className="glass-strong animate-fade-in rounded-2xl p-lg md:p-xl w-full max-w-[440px] relative z-[1]">
        <div className="text-center mb-xl">
          <img src="/logo-ayibuzz.png" alt="Ayibuzz Media" className="h-14 w-auto mb-lg mx-auto object-contain" />
          <h1 className="font-display text-2xl font-extrabold mb-1.5 text-[var(--text-primary)]">Bon retour</h1>
          <p className="text-[var(--text-muted)] text-sm">
            Connectez-vous à votre compte Ayibuzz
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-md">
            <label className="block text-xs md:text-sm font-semibold text-[var(--text-secondary)] mb-2">Adresse e-mail</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="input-field pl-[40px]"
                required
              />
            </div>
          </div>

          <div className="mb-lg">
            <label className="block text-xs md:text-sm font-semibold text-[var(--text-secondary)] mb-2">Mot de passe</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-[40px]"
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
            {loading ? 'Connexion en cours...' : 'Se connecter'} <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-center mt-lg text-sm text-[var(--text-muted)]">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="text-[var(--brand-accent)] font-semibold hover:underline no-underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
