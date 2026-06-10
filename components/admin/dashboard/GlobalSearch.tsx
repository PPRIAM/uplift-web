'use client';

import React from 'react';
import Link from 'next/link';
import { Search, RefreshCw } from 'lucide-react';
import { formatDateShort } from '@/lib/dateUtils';

interface GlobalSearchProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searching: boolean;
  searchResults: {
    events: any[];
    reservations: any[];
    applications: any[];
  };
}

export function GlobalSearch({ searchQuery, setSearchQuery, searching, searchResults }: GlobalSearchProps) {
  if (searchQuery.trim().length === 0) return null;

  return (
    <div className="bg-white border-2 border-black rounded-[18px] p-6 shadow-[4px_4px_0px_0px_#000000] mb-8">
      <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
        <h2 className="font-sans font-extrabold text-lg text-black flex items-center gap-2">
          <Search size={18} /> Résultats de recherche fédérée pour "{searchQuery}"
        </h2>
        <button
          onClick={() => setSearchQuery('')}
          className="px-3 py-1 text-xs font-bold border-2 border-black rounded bg-white shadow-[1px_1px_0px_#000000] hover:bg-gray-50"
        >
          Fermer
        </button>
      </div>

      {searching ? (
        <div className="flex flex-col items-center justify-center py-12 text-black/60 font-mono text-sm">
          <RefreshCw size={24} className="animate-spin mb-2" />
          Recherche en cours dans la base de données...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Événements trouvés */}
          <div>
            <h3 className="font-sans font-bold text-sm text-black mb-3 border-b-2 border-black pb-1 uppercase tracking-wide">
              Événements ({searchResults.events.length})
            </h3>
            {searchResults.events.length === 0 ? (
              <p className="text-black/40 text-xs font-mono">Aucun événement correspondant.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {searchResults.events.map(evt => (
                  <Link
                    key={evt.id}
                    href="/admin/events"
                    className="p-3 border-2 border-black rounded-lg bg-[#8FAF6A]/10 hover:bg-[#8FAF6A]/20 transition-colors block text-left"
                  >
                    <div className="font-bold text-xs text-black">{evt.name}</div>
                    <div className="text-[10px] text-black/60 font-mono mt-1">
                      {formatDateShort(evt.date_time)} · {evt.city || evt.location_name}
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {evt.featured && (
                        <span className="bg-[#F5D547] text-[8px] font-bold border border-black px-1 py-0.5 rounded font-mono">Vedette</span>
                      )}
                      {evt.is_live && (
                        <span className="bg-[#8FAF6A] text-[8px] font-bold border border-black px-1 py-0.5 rounded font-mono text-white">LIVE</span>
                      )}
                      {!evt.published && (
                        <span className="bg-gray-300 text-[8px] font-bold border border-black px-1 py-0.5 rounded font-mono">Brouillon</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Réservations trouvées */}
          <div>
            <h3 className="font-sans font-bold text-sm text-black mb-3 border-b-2 border-black pb-1 uppercase tracking-wide">
              Réservations ({searchResults.reservations.length})
            </h3>
            {searchResults.reservations.length === 0 ? (
              <p className="text-black/40 text-xs font-mono">Aucune réservation correspondante.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {searchResults.reservations.map(res => (
                  <Link
                    key={res.id}
                    href="/admin/reservations"
                    className="p-3 border-2 border-black rounded-lg bg-[#F4A7B9]/10 hover:bg-[#F4A7B9]/20 transition-colors block text-left"
                  >
                    <div className="font-bold text-xs text-black">{res.full_name}</div>
                    <div className="text-[10px] text-black/60 font-mono overflow-hidden text-ellipsis">{res.email}</div>
                    <div className="text-[10px] text-black/50 mt-1">
                      Événement: <span className="font-semibold">{res.events?.name || 'Inconnu'}</span> ({res.quantity} ticket{res.quantity > 1 ? 's' : ''})
                    </div>
                    <div className="mt-2">
                      <span className={`text-[8px] font-bold border border-black px-1.5 py-0.5 rounded font-mono ${
                        res.status === 'confirmed' ? 'bg-[#8FAF6A]' : 'bg-[#F5D547]'
                      }`}>
                        {res.status === 'confirmed' ? 'CONFIRMÉ' : 'EN ATTENTE'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Candidatures d'intervenants trouvées */}
          <div>
            <h3 className="font-sans font-bold text-sm text-black mb-3 border-b-2 border-black pb-1 uppercase tracking-wide">
              Candidatures ({searchResults.applications.length})
            </h3>
            {searchResults.applications.length === 0 ? (
              <p className="text-black/40 text-xs font-mono">Aucune candidature correspondante.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {searchResults.applications.map(app => (
                  <Link
                    key={app.id}
                    href="/admin/speaker-applications"
                    className="p-3 border-2 border-black rounded-lg bg-[#C9B8E8]/10 hover:bg-[#C9B8E8]/20 transition-colors block text-left"
                  >
                    <div className="font-bold text-xs text-black">{app.full_name}</div>
                    <div className="text-[10px] text-black/60 font-mono">{app.email}</div>
                    <div className="text-[10px] text-black/50 font-bold mt-1 uppercase tracking-wide">{app.role}</div>
                    <div className="mt-2">
                      <span className={`text-[8px] font-bold border border-black px-1.5 py-0.5 rounded font-mono ${
                        app.status === 'approved' ? 'bg-[#8FAF6A]' : app.status === 'rejected' ? 'bg-red-300' : 'bg-[#C9B8E8]'
                      }`}>
                        {app.status === 'approved' ? 'APPROUVÉE' : app.status === 'rejected' ? 'REJETÉE' : 'EN ATTENTE'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
