'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { createClient } from '@/utils/supabase/client';
import {
  CheckCircle, ArrowLeft, ArrowRight, User, Mail, Users, Ticket,
  AlertCircle, Send, Calendar, MapPin, ChevronRight,
  Info, ExternalLink, Plus, Trash2, UserPlus, Upload,
} from 'lucide-react';
import { formatDateTime } from '@/lib/dateUtils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface GuestEntry {
  id:        string;   // stable React key
  full_name: string;
  email:     string;
  // per-field validation state
  nameError:  string;
  emailError: string;
}

interface SubmitResult {
  guest:   GuestEntry;
  success: boolean;
  error?:  string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

function makeGuest(overrides: Partial<GuestEntry> = {}): GuestEntry {
  return {
    id:         Math.random().toString(36).slice(2),
    full_name:  '',
    email:      '',
    nameError:  '',
    emailError: '',
    ...overrides,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** A single guest entry card with name + email fields */
function GuestCard({
  guest,
  index,
  total,
  onChange,
  onRemove,
  allEmails,
}: {
  guest:     GuestEntry;
  index:     number;
  total:     number;
  onChange:  (id: string, field: 'full_name' | 'email', value: string) => void;
  onRemove?: (id: string) => void;
  allEmails: string[];
}) {
  const isPrimary = index === 0;
  const label     = isPrimary ? 'Votre réservation' : `Invité ${index}`;

  return (
    <div
      className={`border-2 rounded-2xl p-5 md:p-6 relative transition-colors duration-200 animate-fade-in-up ${isPrimary ? 'border-[var(--border-default)] bg-[rgba(14,26,212,0.03)]' : 'border-[var(--border-subtle)] bg-transparent'}`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between mb-md">
        <div className="flex items-center gap-sm">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isPrimary ? 'bg-[var(--gradient-brand)]' : 'bg-[rgba(14,26,212,0.1)]'}`}>
            <User size={14} className={isPrimary ? 'text-white' : 'text-[var(--brand-accent)]'} />
          </div>
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            {label}
          </span>
        </div>
        {!isPrimary && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(guest.id)}
            aria-label={`Supprimer ${label}`}
            className="bg-red-500/8 border border-red-500/20 rounded-lg px-2.5 py-1.5 cursor-pointer flex items-center gap-1.5 text-[var(--brand-danger)] text-xs font-semibold transition-all hover:bg-red-500/15"
          >
            <Trash2 size={13} /> Retirer
          </button>
        )}
      </div>

      {/* Name field */}
      <div className="mb-3.5">
        <label
          htmlFor={`name-${guest.id}`}
          className="block text-[11px] font-bold text-[var(--text-muted)] mb-1.5 uppercase tracking-wide"
        >
          Nom complet *
        </label>
        <div className="relative">
          <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            id={`name-${guest.id}`}
            type="text"
            value={guest.full_name}
            onChange={e => onChange(guest.id, 'full_name', e.target.value)}
            placeholder="Prénom Nom"
            className={`input-field pl-[38px] ${guest.nameError ? 'border-[var(--brand-danger)] focus:border-[var(--brand-danger)]' : ''}`}
            autoComplete="name"
          />
        </div>
        {guest.nameError && (
          <p className="text-xs text-[var(--brand-danger)] mt-1.5 flex items-center gap-1">
            <AlertCircle size={11} /> {guest.nameError}
          </p>
        )}
      </div>

      {/* Email field */}
      <div>
        <label
          htmlFor={`email-${guest.id}`}
          className="block text-[11px] font-bold text-[var(--text-muted)] mb-1.5 uppercase tracking-wide"
        >
          Adresse e-mail * <span className="normal-case font-normal text-[10px]">(unique par réservation)</span>
        </label>
        <div className="relative">
          <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            id={`email-${guest.id}`}
            type="email"
            value={guest.email}
            onChange={e => onChange(guest.id, 'email', e.target.value)}
            placeholder="email@exemple.com"
            className={`input-field pl-[38px] ${guest.emailError ? 'border-[var(--brand-danger)] focus:border-[var(--brand-danger)]' : ''}`}
            autoComplete="email"
          />
        </div>
        {guest.emailError && (
          <p className="text-xs text-[var(--brand-danger)] mt-1.5 flex items-center gap-1">
            <AlertCircle size={11} /> {guest.emailError}
          </p>
        )}
      </div>
    </div>
  );
}

/** Summary row after partial/full submission */
function SubmitResultRow({ result, index }: { result: SubmitResult; index: number }) {
  return (
    <div className={`flex items-center gap-md p-3.5 rounded-xl border ${result.success ? 'bg-green-500/8 border-green-500/25' : 'bg-red-500/8 border-red-500/25'}`}>
      {result.success
        ? <CheckCircle size={16} className="text-[var(--brand-success)]" />
        : <AlertCircle size={16} className="text-[var(--brand-danger)]" />}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-[var(--text-primary)] mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
          {result.guest.full_name || `Inscrit ${index + 1}`}
          <span className="font-normal text-[var(--text-muted)] ml-1.5 text-xs">
            ({result.guest.email})
          </span>
        </p>
        <p className={`text-xs ${result.success ? 'text-[var(--brand-success)]' : 'text-[var(--brand-danger)]'}`}>
          {result.success ? 'Réservation confirmée ✓' : result.error}
        </p>
      </div>
    </div>
  );
}

// ─── Main Form Component ──────────────────────────────────────────────────────
function ReservationForm() {
  const searchParams = useSearchParams();
  const eventId  = searchParams.get('event');
  const ticketId = searchParams.get('ticket');
  const tierId   = searchParams.get('tier');
  const { user, isAuthenticated, login } = useAuthStore();

  const [event,  setEvent]  = useState<any>(null);
  const [ticket, setTicket] = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results,    setResults]    = useState<SubmitResult[] | null>(null);
  const [globalError, setGlobalError] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'none' | 'moncash' | 'natcash'>('none');
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);

  const [myReservations, setMyReservations] = useState<any[]>([]);

  // ── Guest list — starts with 1 primary guest ──────────────────────────────
  const [guests, setGuests] = useState<GuestEntry[]>(() => {
    const initialQty = parseInt(searchParams.get('qty') || '1');
    return Array.from({ length: Math.max(1, Math.min(10, initialQty)) }, (_, i) =>
      makeGuest(i === 0 ? { full_name: user?.name || '', email: user?.email || '' } : {})
    );
  });

  // Pre-fill primary guest when user session loads
  useEffect(() => {
    if (user) {
      setGuests(prev => prev.map((g, i) =>
        i !== 0 ? g : {
          ...g,
          full_name: g.full_name || user.name || '',
          email:     g.email     || user.email || '',
        }
      ));
    }
  }, [user]);

  // Fetch event + user reservations
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      if (eventId) {
        const { data: evt } = await supabase.from('events')
          .select('id, name, date_time, location_name, city, capacity, registered_count')
          .eq('id', eventId).single();
        setEvent(evt);

        if (ticketId) {
          const { data: tkt } = await supabase.from('tickets').select('*').eq('id', ticketId).single();
          setTicket(tkt);
        }
      }
      if (user?.email) {
        const { data: resvs } = await supabase.from('reservations')
          .select('*, events(name, date_time, location_name, city)')
          .eq('email', user.email.toLowerCase())
          .order('created_at', { ascending: false });
        setMyReservations(resvs || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [eventId, ticketId, user?.email]);

  let displayPrice = ticket?.price || 0;
  let displayName = ticket ? ticket.name : 'Entrée gratuite';
  if (ticket?.pricing_tiers && tierId) {
    const tier = ticket.pricing_tiers.find((t: any) => t.id === tierId);
    if (tier) {
      displayPrice = tier.price;
      displayName = `${ticket.name} (${tier.name})`;
    }
  }

  // ── Guest mutation helpers ─────────────────────────────────────────────────
  const updateGuest = useCallback((id: string, field: 'full_name' | 'email', value: string) => {
    setGuests(prev => prev.map(g => g.id !== id ? g : {
      ...g,
      [field]:        value,
      // clear error on typing
      nameError:  field === 'full_name' ? '' : g.nameError,
      emailError: field === 'email'     ? '' : g.emailError,
    }));
  }, []);

  const addGuest = () => {
    if (guests.length >= 10) return;
    setGuests(prev => [...prev, makeGuest()]);
  };

  const removeGuest = (id: string) => {
    setGuests(prev => prev.filter(g => g.id !== id));
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    let valid     = true;
    const seenEmails = new Set<string>();

    const updated = guests.map(g => {
      const nameError  = !g.full_name.trim() ? 'Le nom est obligatoire.' : '';
      let   emailError = '';

      const normalizedEmail = g.email.toLowerCase().trim();

      if (!normalizedEmail) {
        emailError = "L'adresse e-mail est obligatoire.";
      } else if (!EMAIL_RE.test(normalizedEmail)) {
        emailError = 'Adresse e-mail invalide (ex: nom@exemple.com).';
      } else if (seenEmails.has(normalizedEmail)) {
        emailError = 'Cette adresse e-mail est déjà utilisée dans ce formulaire. Utilisez une adresse différente.';
      } else {
        seenEmails.add(normalizedEmail);
      }

      if (nameError || emailError) valid = false;
      return { ...g, nameError, emailError };
    });

    setGuests(updated);
    return valid;
  };

  // ── Submission — one API call per guest (sequential) ──────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    setResults(null);

    if (!validate()) {
      setGlobalError('Veuillez corriger les erreurs ci-dessous avant de soumettre.');
      return;
    }

    if (displayPrice > 0) {
      if (paymentMethod === 'none') {
        setGlobalError('Veuillez sélectionner un moyen de paiement.');
        return;
      }
      if (!paymentProofFile) {
        setGlobalError('Veuillez importer une preuve de paiement (Capture d\'écran).');
        return;
      }
    }

    setSubmitting(true);
    let payment_proof_url = '';

    if (displayPrice > 0 && paymentProofFile) {
      const supabase = createClient();
      const fileExt = paymentProofFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('payment_proofs')
        .upload(fileName, paymentProofFile);

      if (uploadError) {
        setGlobalError(`Erreur lors de l'upload de la preuve de paiement: ${uploadError.message}`);
        setSubmitting(false);
        return;
      }
      payment_proof_url = data.path;
    }

    const submittedResults: SubmitResult[] = [];

    for (const guest of guests) {
      try {
        const res = await fetch('/api/reservations', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: guest.full_name.trim(),
            email:     guest.email.toLowerCase().trim(),
            quantity:  1,           // each guest = 1 place
            event_id:  eventId,
            ticket_id: ticketId,
            ticket_tier: tierId,
            payment_method: paymentMethod,
            payment_proof_url,
          }),
        });

        const contentType = res.headers.get('content-type') || '';
        let data: any = {};
        if (contentType.includes('application/json')) {
          data = await res.json();
        }

        if (res.ok && data.success) {
          submittedResults.push({ guest, success: true });
        } else {
          submittedResults.push({
            guest,
            success: false,
            error: data.error || `Erreur ${res.status}.`,
          });
        }
      } catch (err: any) {
        submittedResults.push({
          guest,
          success: false,
          error: err.message || 'Erreur réseau. Veuillez réessayer.',
        });
      }
    }

    setResults(submittedResults);
    setSubmitting(false);
  };

  // ─── Render guards ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="text-center py-3xl px-md min-h-[60vh] flex items-center justify-center">
      <p className="text-[var(--text-muted)] text-base">Chargement...</p>
    </div>
  );

  // ── Results screen (after submission) ──────────────────────────────────────
  if (results) {
    const succeeded = results.filter(r => r.success);
    const failed    = results.filter(r => !r.success);
    const allOk     = failed.length === 0;

    return (
      <div className="max-w-[580px] mx-auto py-2xl md:py-3xl px-md md:px-lg">
        {/* Icon */}
        <div className={`w-[88px] h-[88px] rounded-full flex items-center justify-center mx-auto mb-lg shadow-lg ${allOk ? 'bg-[var(--gradient-brand)] shadow-[rgba(14,26,212,0.25)]' : 'bg-gradient-to-br from-[var(--brand-warning)] to-[var(--brand-danger)] shadow-red-500/20'}`}>
          {allOk ? <CheckCircle size={40} className="text-white" /> : <AlertCircle size={40} className="text-white" />}
        </div>

        <div className={`badge mb-md ${allOk ? 'bg-green-500/12 text-[var(--brand-success)] border border-green-500/25' : 'bg-amber-500/12 text-[var(--brand-warning)] border border-amber-500/25'}`}>
          {allOk ? 'Toutes les réservations confirmées' : `${succeeded.length}/${results.length} réservation(s) réussie(s)`}
        </div>

        <h1 className="font-display text-2xl md:text-4xl font-black tracking-tight mb-sm">
          {allOk ? 'Inscription réussie !' : 'Résumé des inscriptions'}
        </h1>
        <p className="text-[var(--text-muted)] text-sm md:text-base leading-relaxed mb-lg">
          {allOk
            ? `Toutes les ${results.length} place(s) pour ${event?.name || 'Ayibuzz Media'} ont été confirmées.`
            : `${succeeded.length} place(s) confirmée(s), ${failed.length} en erreur. Corrigez les erreurs et réessayez.`}
        </p>

        {/* Per-guest status list */}
        <div className="flex flex-col gap-sm mb-xl">
          {results.map((r, i) => <SubmitResultRow key={r.guest.id} result={r} index={i} />)}
        </div>

        {/* Retry partial failures */}
        {failed.length > 0 && (
          <button
            onClick={() => {
              // Keep only failed guests and let the user retry
              setGuests(failed.map(f => ({ ...f.guest, nameError: '', emailError: '' })));
              setResults(null);
              setGlobalError('');
            }}
            className="btn-secondary w-full mb-sm flex items-center justify-center gap-sm"
          >
            <Send size={15} /> Réessayer les inscriptions échouées ({failed.length})
          </button>
        )}

        <div className="flex gap-sm justify-center flex-wrap">
          <Link href={eventId ? `/events/${eventId}` : '/events'} className="btn-primary no-underline">
            Retour à l'événement
          </Link>
          <Link href="/events" className="btn-secondary no-underline">
            Tous les événements
          </Link>
        </div>
      </div>
    );
  }

  // ── My Reservations (no eventId) ───────────────────────────────────────────
  if (!eventId) return (
    <div className="max-w-[800px] mx-auto px-md md:px-lg py-xl md:py-2xl">
      <div className="mb-xl">
        <div className="badge badge-primary mb-sm">Dashboard</div>
        <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight mb-xs">
          Mes réservations
        </h1>
        <p className="text-[var(--text-muted)] text-base">
          Retrouvez ici toutes vos inscriptions aux événements Ayibuzz Media.
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="card p-lg text-center">
          <div className="w-[60px] h-[60px] rounded-full bg-[rgba(14,26,212,0.08)] flex items-center justify-center mx-auto mb-md">
            <User size={28} className="text-[var(--brand-accent)]" />
          </div>
          <h2 className="text-xl font-extrabold mb-sm">Connectez-vous pour voir vos réservations</h2>
          <p className="text-[var(--text-muted)] text-sm mb-lg max-w-[400px] mx-auto">
            Pour accéder à l'historique de vos billets et gérer vos participations, vous devez être connecté.
          </p>
          <div className="flex gap-sm justify-center">
            <Link href="/auth/login" className="btn-primary no-underline">Se connecter</Link>
            <Link href="/events" className="btn-secondary no-underline">Parcourir les événements</Link>
          </div>
        </div>
      ) : myReservations.length === 0 ? (
        <div className="card p-xl text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-lg">
            <Ticket size={28} className="text-[var(--text-muted)]" />
          </div>
          <h2 className="text-xl font-extrabold mb-sm">Aucune réservation pour le moment</h2>
          <p className="text-[var(--text-muted)] text-sm mb-lg">
            Vous n'avez pas encore de réservations enregistrées avec cet email ({user?.email}).
          </p>
          <Link href="/events" className="btn-primary no-underline inline-flex items-center gap-sm">
            Découvrir les événements <ExternalLink size={16} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-md">
          {myReservations.map((res: any) => (
            <div key={res.id} className="card p-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]">
              <div className="flex justify-between items-start flex-wrap gap-md">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-sm mb-sm">
                    <span className="badge badge-success text-[10px]">Confirmé</span>
                    <span className="text-xs text-[var(--text-muted)]">ID: {res.id.split('-')[0].toUpperCase()}</span>
                  </div>
                  <h3 className="text-xl font-extrabold mb-sm">{res.events?.name}</h3>
                  <div className="flex flex-col gap-sm">
                    <div className="flex items-center gap-sm text-[var(--text-secondary)] text-sm">
                      <Calendar size={16} className="text-[var(--brand-accent)]" />
                      {res.events?.date_time ? formatDateTime(res.events.date_time) : 'À venir'}
                    </div>
                    <div className="flex items-center gap-sm text-[var(--text-secondary)] text-sm">
                      <MapPin size={16} className="text-[var(--brand-accent)]" />
                      {res.events?.location_name}, {res.events?.city}
                    </div>
                    <div className="flex items-center gap-sm text-[var(--text-secondary)] text-sm">
                      <Users size={16} className="text-[var(--brand-accent)]" />
                      {res.quantity} place{res.quantity > 1 ? 's' : ''} réservée{res.quantity > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-sm items-end">
                  <Link href={`/events/${res.event_id}`} className="btn-secondary no-underline text-xs flex items-center gap-xs">
                    Voir détails <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-xl p-lg rounded-2xl bg-[rgba(14,26,212,0.04)] flex gap-md items-start">
        <Info size={20} className="text-[var(--brand-accent)] shrink-0 mt-0.5" />
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Vous avez réservé pour un événement mais il n'apparaît pas ? Assurez-vous d'utiliser l'adresse email <strong>{user?.email || 'avec laquelle vous avez réservé'}</strong>. Si le problème persiste, contactez le support.
        </p>
      </div>
    </div>
  );

  // ── Registration Form ──────────────────────────────────────────────────────
  const allCurrentEmails = guests.map(g => g.email.toLowerCase().trim());

  // Force Login if buying ticket but not authenticated
  if (eventId && !isAuthenticated) {
    const loginUrl = `/auth/login?redirect=${encodeURIComponent(`/my-reservations?event=${eventId}&qty=${searchParams.get('qty') || 1}${ticketId ? `&ticket=${ticketId}` : ''}${tierId ? `&tier=${tierId}` : ''}`)}`;
    
    return (
      <div className="max-w-[440px] mx-auto my-3xl px-md">
        <div className="text-center mb-xl">
          <div className="w-14 h-14 rounded-full bg-[rgba(14,26,212,0.08)] flex items-center justify-center mx-auto mb-md">
            <User size={24} className="text-[var(--brand-accent)]" />
          </div>
          <h1 className="font-display text-2xl font-extrabold mb-xs">
             Connectez-vous pour réserver
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
             Vous devez posséder un compte Ayibuzz pour continuer votre réservation.
          </p>
        </div>

        <div className="card p-lg text-center">
           <p className="mb-lg text-[var(--text-secondary)]">
             Connectez-vous ou créez un compte rapidement pour finaliser votre inscription.
           </p>
           <Link href={loginUrl} className="btn-primary w-full flex justify-center items-center gap-sm py-3.5 no-underline">
             Se connecter / S'inscrire <ArrowRight size={16} />
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto px-md md:px-lg py-xl md:py-2xl">
      <Link href={eventId ? `/events/${eventId}` : '/events'} className="inline-flex items-center gap-xs text-[var(--text-muted)] no-underline text-sm mb-xl font-medium hover:text-[var(--text-primary)] transition-colors">
        <ArrowLeft size={15} /> Retour
      </Link>

      {/* Header */}
      <div className="mb-xl">
        <div className="badge badge-primary mb-sm">Inscription</div>
        <h1 className="font-display text-2xl md:text-4xl font-black tracking-tight mb-xs">
          Réservez vos places
        </h1>
        {event ? (
          <p className="text-[var(--text-muted)] text-sm md:text-base">
            {event.name} · {event.location_name}, {event.city}
          </p>
        ) : (
          <div className="flex items-center gap-sm text-[var(--brand-danger)] bg-red-500/5 p-3 rounded-lg border border-red-500/10">
            <AlertCircle size={16} />
            <span className="text-sm font-semibold">Événement introuvable</span>
          </div>
        )}
      </div>

      {/* Multi-email info banner */}
      <div className="flex gap-sm items-start bg-[rgba(14,26,212,0.04)] border border-[var(--border-subtle)] rounded-xl p-3.5 mb-lg">
        <Info size={16} className="text-[var(--brand-accent)] shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Chaque place doit être liée à une <strong>adresse e-mail unique</strong>. Pour réserver pour plusieurs personnes, ajoutez un invité par place.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>

        {/* ── Guest cards ───────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-md mb-md">
          {guests.map((guest, i) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              index={i}
              total={guests.length}
              onChange={updateGuest}
              onRemove={i > 0 ? removeGuest : undefined}
              allEmails={allCurrentEmails}
            />
          ))}
        </div>

        {/* ── Add guest button ──────────────────────────────────────────────── */}
        {guests.length < 10 && (
          <button
            type="button"
            onClick={addGuest}
            className="w-full py-3 rounded-xl mb-lg border-2 border-dashed border-[var(--border-default)] bg-transparent color-[var(--brand-primary)] cursor-pointer flex items-center justify-center gap-sm text-sm font-semibold transition-all hover:bg-[rgba(14,26,212,0.05)] hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
          >
            <UserPlus size={16} />
            Ajouter un invité ({guests.length}/10)
          </button>
        )}

        {/* ── Summary card ─────────────────────────────────────────────────── */}
        {event && (
          <div className="bg-[var(--bg-elevated)] rounded-xl p-4 mb-lg flex items-center gap-sm">
            <Ticket size={18} className="text-[var(--brand-accent)]" />
            <div>
              <p className="text-xs md:text-sm font-bold text-[var(--text-primary)] mb-0.5">
                {guests.length} place{guests.length > 1 ? 's' : ''} {ticket ? `— ${displayName}` : '— Entrée gratuite'}
              </p>
              <p className="text-[11px] md:text-xs text-[var(--text-muted)]">
                {ticket && displayPrice > 0 ? `Total: $${displayPrice * guests.length}` : 'Accès gratuit pour tous les invités'}
              </p>
            </div>
          </div>
        )}

        {/* ── Payment Section ─────────────────────────────────────────────────── */}
        {event && displayPrice > 0 && (
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 mb-lg border border-[var(--border-subtle)]">
            <h3 className="text-base font-extrabold mb-md flex items-center gap-sm">
              <span className="w-6 h-6 rounded-full bg-[var(--brand-accent)] text-white inline-flex items-center justify-center text-xs font-bold">$</span>
              Paiement Requis
            </h3>
            
            <div className="grid grid-cols-2 gap-sm mb-lg">
              <label 
                className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col items-center gap-sm transition-all ${paymentMethod === 'moncash' ? 'border-[var(--color-moncash)] bg-red-500/5' : 'border-[var(--border-subtle)] bg-transparent'}`}>
                <input type="radio" name="paymentMethod" checked={paymentMethod === 'moncash'} onChange={() => setPaymentMethod('moncash')} className="hidden" />
                <span className="font-extrabold text-[var(--color-moncash)]">Moncash</span>
              </label>
              <label 
                className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col items-center gap-sm transition-all ${paymentMethod === 'natcash' ? 'border-[var(--color-natcash)] bg-blue-500/5' : 'border-[var(--border-subtle)] bg-transparent'}`}>
                <input type="radio" name="paymentMethod" checked={paymentMethod === 'natcash'} onChange={() => setPaymentMethod('natcash')} className="hidden" />
                <span className="font-extrabold text-[var(--color-natcash)]">Natcash</span>
              </label>
            </div>

            {paymentMethod !== 'none' && (
              <div className="animate-fade-in-up">
                <div className="p-4 bg-[rgba(14,26,212,0.04)] rounded-xl mb-md">
                  <p className="text-xs font-bold mb-sm">Instructions :</p>
                  <ol className="text-xs md:text-sm text-[var(--text-secondary)] pl-5 flex flex-col gap-sm list-decimal">
                    <li>Envoyez le montant total de <strong className="text-[var(--text-primary)]">${displayPrice * guests.length}</strong> sur ce numéro :</li>
                    <li className="list-none pl-0">
                      <div className="py-2.5 px-4 text-base md:text-lg font-black bg-[var(--bg-elevated)] rounded-lg inline-block tracking-widest border border-[var(--border-subtle)]">
                        {paymentMethod === 'moncash' ? '38529518' : '55291380'}
                      </div>
                      <p className="text-[11px] mt-1">Nom associé : {paymentMethod === 'moncash' ? 'Willmarvens FLEURIZAR willmarvens' : 'Nervil Mike'}</p>
                    </li>
                    <li>Prenez une capture d'écran de l'écran de confirmation.</li>
                    <li>Importez cette capture ci-dessous pour validation.</li>
                  </ol>
                </div>

                <label className="block text-xs md:text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  Preuve de paiement (Obligatoire)
                </label>
                <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${paymentProofFile ? 'border-[var(--brand-success)] bg-emerald-500/5' : 'border-[var(--border-default)] bg-[var(--bg-elevated)]'}`}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    aria-label="Importer une preuve de paiement"
                    onChange={e => setPaymentProofFile(e.target.files?.[0] || null)} 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {paymentProofFile ? (
                    <div className="flex flex-col items-center gap-sm text-[var(--brand-success)]">
                      <CheckCircle size={24} />
                      <span className="text-sm font-semibold">{paymentProofFile.name} selected</span>
                      <span className="text-xs text-[var(--text-muted)]">Cliquer pour changer</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-sm text-[var(--text-muted)]">
                      <Upload size={24} />
                      <span className="text-sm font-semibold text-[var(--text-primary)]">Touchez ici pour importer</span>
                      <span className="text-xs">Photos, Captures d'écran (max 5MB)</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Global error ──────────────────────────────────────────────────── */}
        {globalError && (
          <div className="flex items-center gap-sm bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 mb-md">
            <AlertCircle size={16} className="text-[var(--brand-danger)]" />
            <p className="text-xs text-[var(--brand-danger)] font-semibold">{globalError}</p>
          </div>
        )}

        {/* ── Submit ────────────────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={submitting || !event}
          className={`btn-primary w-full flex items-center justify-center gap-sm py-4 text-base ${submitting ? 'cursor-wait opacity-70' : !event ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
        >
          {submitting
            ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full inline-block animate-spin" /> Envoi en cours…</>
            : <><Send size={16} /> Confirmer {guests.length} inscription{guests.length > 1 ? 's' : ''}</>
          }
        </button>

        <p className="text-[11px] text-[var(--text-muted)] text-center mt-3">
          Vos données sont utilisées uniquement pour la gestion des inscriptions à Ayibuzz Media.
        </p>
      </form>
    </div>
  );
}

// ─── Page export (wrapped in Suspense for useSearchParams) ────────────────────
export default function MyReservationsPage() {
  return (
    <Suspense fallback={<div className="p-xl text-center">Chargement...</div>}>
      <ReservationForm />
    </Suspense>
  );
}
