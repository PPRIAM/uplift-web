'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, UserPlus, Minus, Plus } from 'lucide-react';
import { calculateTicketStats, formatPrice } from '@/lib/ticketUtils';

interface EventClientProps {
  event:    any;
  tickets:  any[];
  sessions: any[];
  speakers: any[];
}

export default function EventClient({ event, tickets }: EventClientProps) {
  const [qty,            setQty]            = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(tickets[0]?.id || null);
  const [selectedTier,   setSelectedTier]   = useState<string | null>(
    tickets[0]?.pricing_tiers?.[0]?.id || null
  );

  const handleSelectTicket = (id: string, tiers: any[]) => {
    setSelectedTicket(id);
    setSelectedTier(tiers?.[0]?.id || null);
  };

  const {
    daysUntil,
    spotsLeft,
    fillPct,
    standardPoolRemaining,
  } = calculateTicketStats(event, tickets);

  const selectedTicketObj = tickets.find(t => t.id === selectedTicket);
  
  let price = selectedTicketObj?.price ?? 0;
  if (selectedTicketObj?.pricing_tiers && selectedTicketObj.pricing_tiers.length > 0) {
    const tierObj = selectedTicketObj.pricing_tiers.find((tr: any) => tr.id === selectedTier);
    if (tierObj) {
      price = tierObj.price;
    }
  }
  
  let currentTicketRemaining = 0;
  if (selectedTicketObj) {
    if (selectedTicketObj.allocation_mode === 'expanded') {
      currentTicketRemaining = Math.max(0, selectedTicketObj.quantity - selectedTicketObj.sold);
    } else {
      currentTicketRemaining = Math.max(0, Math.min(selectedTicketObj.quantity - selectedTicketObj.sold, standardPoolRemaining));
    }
  }

  const maxQty = Math.min(10, currentTicketRemaining);

  const registerUrl = `/my-reservations?event=${event.id}&qty=${qty}${selectedTicket ? `&ticket=${selectedTicket}` : ''}${selectedTier ? `&tier=${selectedTier}` : ''}`;

  return (
    <div className="w-full md:w-[360px] shrink-0 md:sticky md:top-[100px]">
      <div className="glass p-lg border border-[var(--border-default)] rounded-2xl">
        <h3 className="font-display text-lg mb-md text-[var(--text-primary)]">Inscription</h3>

        {/* ── Ticket selector ────────────────────────────────────────────── */}
        {tickets.length > 0 && (
          <div className="mb-md">
            <label className="text-xs md:text-sm font-semibold text-[var(--text-secondary)] block mb-sm">
              Type de billet
            </label>
            <div className="flex flex-col gap-sm">
              {tickets.map(t => {
                let maxAvailable = 0;
                if (t.allocation_mode === 'expanded') {
                  maxAvailable = Math.max(0, t.quantity - t.sold);
                } else {
                  maxAvailable = Math.max(0, Math.min(t.quantity - t.sold, standardPoolRemaining));
                }
                return (
                  <div key={t.id} className="flex flex-col gap-sm">
                    <button
                      onClick={() => handleSelectTicket(t.id, t.pricing_tiers)}
                      className={`p-3.5 rounded-xl text-left cursor-pointer border-2 transition-all w-full ${selectedTicket === t.id ? 'border-[var(--brand-accent)] bg-[rgba(14,26,212,0.05)]' : 'border-[var(--border-subtle)] bg-transparent hover:border-[var(--border-default)]'}`}
                    >
                      <div className="flex justify-between mb-0.5">
                        <span className="font-bold text-sm text-[var(--text-primary)]">{t.name}</span>
                        <span className="font-extrabold text-[var(--brand-success)]">
                          {t.pricing_tiers && t.pricing_tiers.length > 0 ? (
                            `À partir de ${formatPrice(Math.min(...t.pricing_tiers.map((tr: any) => tr.price)), t.description)}`
                          ) : (
                            formatPrice(t.price, t.description)
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {maxAvailable} restants
                      </p>
                    </button>

                    {/* Tiers / Variations logic */}
                    {selectedTicket === t.id && t.pricing_tiers && t.pricing_tiers.length > 0 && (
                      <div className="pl-md flex flex-col gap-sm mt-xs">
                        {t.pricing_tiers.map((tr: any) => {
                          const tierInputId = `tier-${t.id}-${tr.id}`;
                          const isSelected = selectedTier === tr.id;
                          
                          return (
                            <label 
                              key={tr.id} 
                              htmlFor={tierInputId}
                              className={`flex items-center gap-sm cursor-pointer p-2.5 px-3.5 border rounded-xl transition-all ${isSelected ? 'bg-[rgba(14,26,212,0.05)] border-[var(--brand-accent)]' : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'}`}
                            >
                              <input 
                                type="radio" 
                                id={tierInputId}
                                name={`tier-group-${t.id}`} 
                                value={tr.id}
                                checked={isSelected} 
                                onChange={() => setSelectedTier(tr.id)} 
                                className="accent-[var(--brand-accent)]"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <span className="text-xs md:text-sm font-bold text-[var(--text-primary)]">{tr.name}</span>
                                  <span className="text-xs md:text-sm font-extrabold text-[var(--brand-success)]">{formatPrice(tr.price, t.description)}</span>
                                </div>
                                {tr.benefits && tr.benefits.length > 0 && (
                                  <ul className="pl-md mt-1.5 text-xs text-[var(--text-muted)] grid gap-xs list-disc">
                                    {tr.benefits.map((b: string, i: number) => <li key={i}>{b}</li>)}
                                  </ul>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Places counter ───────────────────────────────────────────────── */}
        <div className="border-t border-[var(--border-subtle)] pt-md mb-md">
          {/* Price row */}
          <div className="flex flex-col gap-1 mb-sm border-b border-[var(--border-subtle)]/50 pb-sm">
            {qty > 1 && (
              <div className="flex justify-between items-center text-xs text-[var(--text-muted)]">
                <span>Prix unitaire</span>
                <span>{formatPrice(price, selectedTicketObj?.description)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm font-semibold text-[var(--text-secondary)]">
                {qty > 1 ? `Total (${qty} places)` : 'Prix'}
              </span>
              <span className="text-lg font-extrabold text-[var(--brand-success)]">
                {formatPrice(price * qty, selectedTicketObj?.description)}
              </span>
            </div>
          </div>

          {/* Quantity stepper */}
          <div>
            <label className="block text-xs md:text-sm font-semibold text-[var(--text-secondary)] mb-2">
              Nombre de places
            </label>
            <div className="flex items-center gap-0">
              <button
                id="qty-decrease"
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                aria-label="Diminuer"
                className={`w-10 h-10 rounded-l-xl border border-[var(--border-default)] border-r-0 bg-transparent flex items-center justify-center transition-colors ${qty <= 1 ? 'cursor-not-allowed text-[var(--text-muted)]' : 'cursor-pointer text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'}`}
              >
                <Minus size={14} />
              </button>
              <div className="flex-1 h-10 border-t border-b border-[var(--border-default)] flex items-center justify-center font-extrabold text-base bg-[var(--bg-elevated)] min-w-[48px]">
                {qty}
              </div>
              <button
                id="qty-increase"
                type="button"
                onClick={() => setQty(Math.min(maxQty, qty + 1))}
                aria-label="Augmenter"
                className={`w-10 h-10 rounded-r-xl border border-[var(--border-default)] border-l-0 bg-transparent flex items-center justify-center transition-colors ${qty >= maxQty ? 'cursor-not-allowed text-[var(--text-muted)]' : 'cursor-pointer text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'}`}
              >
                <Plus size={14} />
              </button>
            </div>
            {qty > 1 && (
              <p className="text-[11px] md:text-xs text-[var(--text-muted)] mt-2">
                Note: {qty} formulaires individuels seront générés — chaque invité nécessite une adresse e-mail unique.
              </p>
            )}
          </div>
        </div>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        {spotsLeft <= 0 ? (
          <div className="w-full py-3.5 rounded-xl text-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] font-bold text-sm md:text-base mt-md">
            Événement complet
          </div>
        ) : (
          <Link
            href={registerUrl}
            className="btn-primary no-underline w-full flex justify-center items-center gap-sm py-3.5 text-sm md:text-base mt-md"
          >
            {qty > 1 ? <UserPlus size={16} /> : <ArrowRight size={16} />}
            {qty > 1
              ? `Inscrire ${qty} personnes`
              : `S'inscrire ${price === 0 ? 'gratuitement' : ''}`}
          </Link>
        )}

        {/* ── Progress bar ───────────────────────────────────────────────── */}
        <div className="mt-md">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--text-muted)]">
              {spotsLeft > 0 ? `${spotsLeft} place${spotsLeft > 1 ? 's' : ''} restante${spotsLeft > 1 ? 's' : ''}` : 'Complet'}
            </span>
            <span className="font-bold text-[var(--text-primary)]">{fillPct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(100, fillPct)}%` }} />
          </div>
        </div>
      </div>

      {/* Countdown */}
      {daysUntil > 0 && (
        <div className="mt-md text-center p-4 rounded-2xl bg-[rgba(14,26,212,0.04)] border border-[var(--border-subtle)]">
          <p className="text-[10px] md:text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
            L'événement commence dans
          </p>
          <p className="text-xl md:text-2xl font-black text-[var(--brand-accent)]">
            {daysUntil} jour{daysUntil > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
