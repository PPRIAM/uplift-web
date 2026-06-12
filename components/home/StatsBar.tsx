'use client';

interface StatsBarProps {
  totalEvents: number | null;
  featuredEvent?: any | null;
}

// Barre de statistiques d'UPLIFT 2.0 avec chiffres tabulaires mono et disposition aérée
export default function StatsBar({ totalEvents, featuredEvent }: StatsBarProps) {
  if (!featuredEvent) {
    return null; // Do not render if no featured event exists
  }
  return (
    <section className="bg-white border-t-[1.5px] border-b-[1.5px] border-[#0F172A] py-10 px-6 xl:pl-24 font-body">
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* Participants attendus */}
        <div className="text-center md:text-left">
          <div className="font-mono text-[#0E1AD4] text-4xl md:text-5xl font-extrabold leading-none tabular-nums">{featuredEvent.capacity || '300+'}</div>
          <div className="text-xs text-[#64748B] mt-2.5 font-bold uppercase tracking-widest">Participants attendus</div>
        </div>

        {/* Nombre de sessions */}
        <div className="text-center md:text-left">
          <div className="font-mono text-[#0E1AD4] text-4xl md:text-5xl font-extrabold leading-none tabular-nums">
            {totalEvents !== null && totalEvents > 0 ? totalEvents : 3}
          </div>
          <div className="text-xs text-[#64748B] mt-2.5 font-bold uppercase tracking-widest">Sessions</div>
        </div>

        {/* Format */}
        <div className="text-center md:text-left">
          <div className="font-mono text-[#0E1AD4] text-4xl md:text-5xl font-extrabold leading-none tabular-nums">Hybride</div>
          <div className="text-xs text-[#64748B] mt-2.5 font-bold uppercase tracking-widest">Format de l'événement</div>
        </div>

        {/* Catégorie */}
        <div className="text-center md:text-left">
          <div className="font-mono text-[#0E1AD4] text-4xl md:text-5xl font-extrabold leading-none tabular-nums">Conférence</div>
          <div className="text-xs text-[#64748B] mt-2.5 font-bold uppercase tracking-widest">Catégorie</div>
        </div>

      </div>
    </section>
  );
}
