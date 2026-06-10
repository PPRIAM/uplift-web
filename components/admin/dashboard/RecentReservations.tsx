'use client';

import React from 'react';
import Link from 'next/link';
import { formatDateShort } from '@/lib/dateUtils';

interface RecentReservationsProps {
  loading: boolean;
  filteredRecentReservations: any[];
}

export function RecentReservations({ loading, filteredRecentReservations }: RecentReservationsProps) {
  return (
    <div
      className="lg:col-span-2 bg-white border-2 border-black rounded-[18px] p-6 shadow-[4px_4px_0px_0px_#000000] animate-fade-slide-up motion-reduce:animate-none"
      style={{ animationDelay: '400ms' }}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-sans font-extrabold text-lg text-black">
          Réservations récentes
        </h3>
        <Link
          href="/admin/reservations"
          className="text-xs font-bold text-black border-b-2 border-black pb-0.5 hover:opacity-85 transition-opacity"
        >
          Voir toutes les réservations →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-black/5 rounded-xl animate-pulse border-2 border-black/10" />
          ))}
        </div>
      ) : filteredRecentReservations.length === 0 ? (
        <p className="text-black/50 text-center py-12 font-mono text-sm">
          Aucune réservation enregistrée.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredRecentReservations.map(res => (
            <div
              key={res.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-2 border-black rounded-xl bg-white shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000000] transition-all duration-150"
            >
              <div className="flex items-center gap-3">
                {/* Avatar en style brutaliste à fond cobalt clair */}
                <div className="w-10 h-10 rounded-lg border-2 border-black bg-[#E0E7FF] text-[#0E1AD4] flex items-center justify-center text-xs font-extrabold font-mono shadow-[1px_1px_0px_#000000]">
                  {res.full_name ? res.full_name[0].toUpperCase() : '?'}
                </div>
                <div>
                  <h4 className="font-sans font-bold text-xs text-black">{res.full_name}</h4>
                  <p className="text-[10px] text-black/60 font-mono mt-0.5">
                    {res.events?.name} · <span className="font-semibold text-black">{res.quantity}</span> ticket{res.quantity > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <span className="text-[10px] text-black/50 font-mono font-medium">
                  {formatDateShort(res.created_at)}
                </span>
                <span className={`text-[10px] font-bold border-2 border-black px-2.5 py-1 rounded-full font-mono shadow-[1px_1px_0px_#000000] ${
                  res.status === 'confirmed' ? 'bg-[#E0E7FF] text-[#0E1AD4]' : 'bg-[#F1F5F9] text-slate-500'
                }`}>
                  {res.status === 'confirmed' ? 'confirmé' : 'en attente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
