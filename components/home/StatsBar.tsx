'use client';

interface StatsBarProps {
  totalEvents: number | null;
}

// Barre de statistiques d'UPLIFT 2.0 avec chiffres tabulaires mono et disposition aérée
export default function StatsBar({ totalEvents }: StatsBarProps) {
  return (
    <section className="bg-white border-t-[1.5px] border-b-[1.5px] border-[#0F172A] py-10 px-6 xl:pl-24 font-body">
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* Participants attendus */}
        <div className="text-center md:text-left">
          <div className="font-mono text-[#0E1AD4] text-4xl md:text-5xl font-extrabold leading-none tabular-nums">300+</div>
          <div className="text-xs text-[#64748B] mt-2.5 font-bold uppercase tracking-widest">Participants attendus</div>
        </div>

        {/* Nombre de sessions */}
        <div className="text-center md:text-left">
          <div className="font-mono text-[#0E1AD4] text-4xl md:text-5xl font-extrabold leading-none tabular-nums">
            {totalEvents !== null && totalEvents > 0 ? totalEvents : 3}
          </div>
          <div className="text-xs text-[#64748B] mt-2.5 font-bold uppercase tracking-widest">Sessions</div>
        </div>

        {/* Date fixe de l'événement */}
        <div className="text-center md:text-left">
          <div className="font-mono text-[#0E1AD4] text-4xl md:text-5xl font-extrabold leading-none tabular-nums">25 Avr</div>
          <div className="text-xs text-[#64748B] mt-2.5 font-bold uppercase tracking-widest">Date de l&apos;événement</div>
        </div>

        {/* Gratuité de l'événement */}
        <div className="text-center md:text-left">
          <div className="font-mono text-[#0E1AD4] text-4xl md:text-5xl font-extrabold leading-none tabular-nums">100%</div>
          <div className="text-xs text-[#64748B] mt-2.5 font-bold uppercase tracking-widest">Gratuit</div>
        </div>

      </div>
    </section>
  );
}
