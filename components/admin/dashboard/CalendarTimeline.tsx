'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatTime } from '@/lib/dateUtils';

interface CalendarTimelineProps {
  calendarMonth: Date;
  selectedDate: Date;
  calendarDays: (Date | null)[];
  hasSessionOnDay: (date: Date) => boolean;
  daySessions: any[];
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  setSelectedDate: (date: Date) => void;
  handleSessionClick: (session: any) => void;
}

export function CalendarTimeline({
  calendarMonth,
  selectedDate,
  calendarDays,
  hasSessionOnDay,
  daySessions,
  handlePrevMonth,
  handleNextMonth,
  setSelectedDate,
  handleSessionClick,
}: CalendarTimelineProps) {
  return (
    <div className="flex flex-col gap-8">

      {/* Calendrier compact */}
      <div
        className="bg-white border-2 border-black rounded-[18px] p-6 shadow-[4px_4px_0px_0px_#000000] animate-fade-slide-up motion-reduce:animate-none"
        style={{ animationDelay: '480ms' }}
      >
        <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-black/10">
          <h4 className="font-sans font-extrabold text-sm text-black animate-none capitalize">
            {new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(calendarMonth)}
          </h4>
          <div className="flex gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-1 border-2 border-black rounded bg-white hover:bg-gray-50 active:translate-x-[1px] active:translate-y-[1px] shadow-[1px_1px_0px_#000000] active:shadow-none transition-all"
              title="Mois précédent"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 border-2 border-black rounded bg-white hover:bg-gray-50 active:translate-x-[1px] active:translate-y-[1px] shadow-[1px_1px_0px_#000000] active:shadow-none transition-all"
              title="Mois suivant"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'].map(day => (
            <span key={day} className="text-[10px] font-bold text-black/50 font-mono uppercase">{day}</span>
          ))}
        </div>

        {/* Grille du calendrier */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className="h-8 w-8" />;
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            const hasSession = hasSessionOnDay(date);

            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`h-8 w-8 text-xs font-mono font-bold rounded-lg flex flex-col items-center justify-center relative border-2 transition-all ${
                  isSelected
                    ? 'bg-[#0E1AD4] border-black text-white shadow-[1px_1px_0px_#000000]'
                    : isToday
                    ? 'bg-black text-white border-black shadow-[1px_1px_0px_#000000]'
                    : 'bg-white border-transparent hover:border-black text-black'
                }`}
              >
                {date.getDate()}
                {/* Indicateur de session en bleu cobalt */}
                {hasSession && !isSelected && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#0E1AD4]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline de la journée sélectionnée */}
      <div
        className="bg-white border-2 border-black rounded-[18px] p-6 shadow-[4px_4px_0px_0px_#000000] flex-1 animate-fade-slide-up motion-reduce:animate-none"
        style={{ animationDelay: '560ms' }}
      >
        <h4 className="font-sans font-extrabold text-sm text-black mb-4">
          Timeline du {selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </h4>

        {daySessions.length === 0 ? (
          <div className="text-center py-8 text-black/40 font-mono text-xs border-2 border-dashed border-black/20 rounded-xl bg-gray-50">
            Aucune session de l'événement vedette ce jour-là.
          </div>
        ) : (
          <div className="relative border-l-2 border-black pl-5 ml-2.5 space-y-5">
            {daySessions.map(session => (
              <div key={session.id} className="relative">

                {/* Puce temporelle cobalt sur la ligne */}
                <div className="absolute -left-[27px] top-1.5 bg-[#0E1AD4] border-2 border-black rounded-full w-3.5 h-3.5 shadow-[1px_1px_0px_#000000]" />

                {/* Conteneur de la session */}
                <div
                  onClick={() => handleSessionClick(session)}
                  className="bg-white border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000000] transition-all duration-150 cursor-pointer select-none"
                >
                  <div className="text-[10px] font-mono font-bold text-black/50">
                    {formatTime(session.start_time)} - {formatTime(session.end_time)}
                  </div>

                  <h5 className="font-sans font-bold text-xs text-black mt-0.5 leading-snug">
                    {session.title}
                  </h5>

                  {session.description && (
                    <p className="text-[10px] text-black/60 mt-1 line-clamp-2 font-medium">
                      {session.description}
                    </p>
                  )}

                  {/* Orateurs associés */}
                  {session.session_speakers && session.session_speakers.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      {session.session_speakers.map((ss: any, sIdx: number) => {
                        const speaker = ss.speakers;
                        if (!speaker) return null;
                        return (
                          <div key={sIdx} className="flex items-center gap-1 bg-[#F1F5F9] border border-black rounded-full px-2 py-0.5 text-[9px] font-bold font-mono shadow-[1px_1px_0px_#000000]">
                            {speaker.profile_image && (
                              <img
                                src={speaker.profile_image}
                                alt={speaker.full_name}
                                className="w-3.5 h-3.5 rounded-full object-cover border border-black"
                              />
                            )}
                            <span>{speaker.full_name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
