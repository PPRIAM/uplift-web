'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Calendar, MapPin, Search, SlidersHorizontal, ChevronRight, X } from 'lucide-react';
import { formatDate } from '@/lib/dateUtils';

interface EventsClientProps {
  initialEvents: any[];
}

export default function EventsClient({ initialEvents }: EventsClientProps) {
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const ALL_TAGS = Array.from(new Set(initialEvents.flatMap(e => e.tags || [])));

  const filtered = initialEvents.filter(e => {
    const title = e.name || '';
    const loc = e.location_name || '';
    const matchSearch = title.toLowerCase().includes(search.toLowerCase()) ||
      loc.toLowerCase().includes(search.toLowerCase());
    const matchTags = selectedTags.length === 0 || selectedTags.some(t => e.tags?.includes(t));
    const isUpcoming = new Date(e.date_time) > new Date();
    const computedStatus = isUpcoming ? 'upcoming' : 'past';
    const matchStatus = statusFilter === 'all' || computedStatus === statusFilter;
    return e.published && matchSearch && matchTags && matchStatus;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const statusColors: Record<string, string> = {
    upcoming: 'badge-success',
    ongoing: 'badge-warning',
    past: 'badge-primary',
  };

  const statusLabels: Record<string, string> = {
    upcoming: 'À venir',
    ongoing: 'En cours',
    past: 'Passé',
  };

  return (
    <>
      {/* Filters */}
      <div className="glass p-5 mb-lg rounded-2xl">
        <div className="flex gap-md flex-wrap items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un événement ou un lieu..."
              className="input-field pl-[42px]"
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-sm">
            {([
              { id: 'all', label: 'Tous' },
              { id: 'upcoming', label: 'À venir' },
              { id: 'past', label: 'Passés' }
            ] as const).map(s => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id as any)}
                className={`py-2 px-4 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${statusFilter === s.id ? 'border-[var(--brand-accent)] bg-[rgba(14,26,212,0.12)] text-[var(--brand-accent)]' : 'border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-default)]'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tag filters */}
        <div className="flex flex-wrap gap-sm mt-md items-center">
          <SlidersHorizontal size={14} className="text-[var(--text-muted)]" />
          {ALL_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`${selectedTags.includes(tag) ? 'badge badge-primary bg-[rgba(14,26,212,0.12)] border-[var(--brand-accent)] text-[var(--brand-accent)]' : 'badge bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)]'} cursor-pointer inline-flex items-center gap-xs transition-colors hover:border-[var(--border-default)]`}
            >
              {tag}
              {selectedTags.includes(tag) && <X size={10} />}
            </button>
          ))}
          {selectedTags.length > 0 && (
            <button 
              onClick={() => setSelectedTags([])} 
              className="text-[var(--brand-danger)] text-xs bg-transparent border-none cursor-pointer hover:underline"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-[var(--text-muted)] text-sm mb-lg">
        <span className="text-[var(--text-primary)] font-bold">{filtered.length}</span> événement{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Events Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 px-6">
          <h3 className="text-xl font-bold mb-2">Aucun événement trouvé</h3>
          <p className="text-[var(--text-muted)] font-medium">Essayez de modifier votre recherche ou vos filtres</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filtered.map((event, index) => {
            const isUpcoming = new Date(event.date_time) > new Date();
            const computedStatus = isUpcoming ? 'upcoming' : 'past';
            return (
              <div key={event.id} className={`card animate-fade-in-up flex flex-col overflow-hidden p-0 animate-delay-${((index % 5) + 1) * 100}`}>
                {/* Cover */}
                <div className="h-[180px] relative overflow-hidden bg-[var(--gradient-brand)]">
                  {event.cover_image && (
                    <Image
                      src={event.cover_image}
                      alt={event.name}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}

                  {/* Overlay */}
                  <div className={`absolute inset-0 ${event.cover_image ? 'bg-gradient-to-b from-slate-950/25 to-slate-950/55' : 'bg-slate-950/35'}`} />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`badge ${statusColors[computedStatus]} backdrop-blur-[8px] bg-slate-950/70 border border-slate-950/10`}>
                      {statusLabels[computedStatus] || computedStatus}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="text-lg font-bold mb-2 font-[Outfit,sans-serif] text-[var(--text-primary)]">{event.name}</h2>
                  <p className="text-xs md:text-sm text-[var(--text-muted)] mb-4 leading-relaxed flex-1 font-medium">{event.tagline}</p>

                  <div className="flex flex-col gap-2 mb-6">
                    <div className="flex items-center gap-2 text-xs md:text-sm text-[var(--text-secondary)] font-medium">
                      <Calendar size={13} className="text-[var(--brand-accent)]" />
                      {formatDate(event.date_time, 'en-HT')}
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-[var(--text-secondary)] font-medium">
                      <MapPin size={13} className="text-[var(--brand-accent)]" />
                      {event.location_name} · {event.city}
                    </div>
                  </div>

                  <Link
                    href={`/events/${event.id}`}
                    className="btn-primary no-underline text-center text-sm flex items-center justify-center gap-1.5 py-3 px-4"
                  >
                    Voir les détails <ChevronRight size={15} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
