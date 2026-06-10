import { Metadata } from 'next';
import { Users, Mic, Video, ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'À propos',
  description: "Découvrez Ayibuzz Media : la scène digitale d'Haïti où la prochaine génération crée, partage et amplifie les histoires qui façonnent notre avenir.",
};

export default function AboutPage() {
  return (
    <div className="bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden w-full relative">
      
      {/* Hero Section */}
      <section className="py-24 md:py-32 px-6 text-center relative border-b border-[var(--border-subtle)] bg-[var(--bg-base)] overflow-hidden">
        {/* Floating background orbs */}
        <div className="orb animate-float w-[700px] h-[700px] bg-[rgba(0,24,255,0.06)] -top-[200px] -right-[150px] [animation-duration:8s]"></div>
        <div className="orb animate-float w-[400px] h-[400px] bg-[rgba(0,194,255,0.04)] -bottom-[100px] -left-[100px] [animation-duration:10s] [animation-delay:2s]"></div>

        <div className="max-w-[900px] mx-auto relative z-10">
          <span className="badge badge-primary inline-flex mb-4">
            Notre Mission
          </span>
          
          <h1 className="font-display text-4xl md:text-6.5xl font-black tracking-tight leading-[1.05] text-[var(--text-primary)] mb-6 uppercase animate-fade-in-up">
            La scène digitale<br />
            <span className="text-[var(--brand-accent)]">d&apos;Haïti</span>
          </h1>
          
          <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed max-w-[650px] mx-auto mb-8 font-medium animate-fade-in-up animate-delay-100">
            Ayibuzz Media est née d&apos;une conviction simple : la jeunesse haïtienne possède un potentiel immense qui ne demande qu&apos;à être canalisé, valorisé et amplifié.
          </p>
          
          <p className="font-display text-lg md:text-2xl text-[var(--brand-accent)] font-bold uppercase tracking-wide mb-10 animate-fade-in-up animate-delay-200">
            Leve ansanm, Briye ansanm
          </p>

          <div className="flex justify-center animate-fade-in-up animate-delay-300">
            <Link 
              href="/auth/register" 
              className="btn-primary no-underline inline-flex items-center gap-2 py-3 px-8 text-sm"
            >
              <span>Rejoindre le mouvement</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Impact */}
      <section className="py-24 md:py-32 px-6 max-w-[1200px] mx-auto w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Block */}
          <div className="lg:col-span-5 text-left">
            <span className="badge badge-primary inline-flex mb-4">
              Impact Social
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight leading-[1.05] text-[var(--text-primary)] mb-6 uppercase">
              Amplifier les voix d&apos;Haïti.
            </h2>
            <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed mb-6 font-medium">
              Ayibuzz Media est née d&apos;une conviction simple: la jeunesse haïtienne possède un potentiel immense qui ne demande qu&apos;à être canalisé, valorisé et amplifié.
            </p>
            <p className="text-[var(--text-muted)] text-xs md:text-sm leading-relaxed font-medium">
              Des Gonaïves à Port-au-Prince, de la diaspora au pays: nous connectons les esprits les plus brillants pour transformer les défis en opportunités. À travers des événements en direct, du contenu original et une communauté engagée, nous offrons une scène pour les créateurs, leaders et visionnaires haïtiens.
            </p>
          </div>
          
          {/* Right Block: Double-Bezel Enclosure Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Impact 1 (Spans 2 cols) */}
            <div className="sm:col-span-2 card p-6 md:p-8 flex items-center gap-6 text-left animate-fade-in-up">
              <div className="w-12 h-12 rounded-[14px] bg-[color-mix(in_srgb,var(--brand-primary)_12%,transparent)] border border-[color-mix(in_srgb,var(--brand-primary)_25%,transparent)] flex items-center justify-center shrink-0">
                <Mic size={24} className="text-[var(--brand-primary)]" />
              </div>
              <div>
                <p className="font-display text-base font-extrabold text-[var(--text-primary)] mb-1 uppercase tracking-tight">Conférences &amp; Événements en direct</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">Des panels, keynotes et ateliers diffusés en direct et disponibles en replay.</p>
              </div>
            </div>

            {/* Impact 2 */}
            <div className="card p-6 md:p-8 text-left h-full animate-fade-in-up animate-delay-100">
              <div className="w-12 h-12 rounded-[14px] bg-[color-mix(in_srgb,var(--brand-accent)_12%,transparent)] border border-[color-mix(in_srgb,var(--brand-accent)_25%,transparent)] flex items-center justify-center mb-4 shrink-0">
                <Video size={20} className="text-[var(--brand-accent)]" />
              </div>
              <p className="font-display text-sm font-extrabold text-[var(--text-primary)] mb-1 uppercase tracking-tight">Contenu original</p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">Podcasts, reportages et interviews exclusifs.</p>
            </div>

            {/* Impact 3 */}
            <div className="card p-6 md:p-8 text-left h-full animate-fade-in-up animate-delay-200">
              <div className="w-12 h-12 rounded-[14px] bg-[color-mix(in_srgb,#10b981_12%,transparent)] border border-[color-mix(in_srgb,#10b981_25%,transparent)] flex items-center justify-center mb-4 shrink-0">
                <Users size={20} className="text-[#10b981]" />
              </div>
              <p className="font-display text-sm font-extrabold text-[var(--text-primary)] mb-1 uppercase tracking-tight">Communauté active</p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">Des membres de toute la diaspora haïtienne.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-32 px-6 bg-[var(--bg-surface)] border-t border-b border-[var(--border-subtle)] relative overflow-hidden">
        {/* Floating background orbs */}
        <div className="orb animate-float w-[500px] h-[500px] bg-[rgba(16,185,129,0.03)] bottom-[-100px] right-[-100px] [animation-duration:12s]"></div>

        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <span className="badge badge-primary inline-flex mb-4">
            Principes
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight leading-[1.05] text-[var(--text-primary)] mb-16 uppercase">Ce qui nous anime</h2>
          
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 list-none p-0 text-left">
            {[
              { n: '01', title: 'Ayiti d\'abord', desc: 'Nous croyons au potentiel endogène de notre pays. Chaque solution doit naître ici, pour ici.' },
              { n: '02', title: 'Solidarité', desc: 'C\'est ensemble que nous pouvons bâtir des solutions durables. Seul on va vite; ensemble on va loin.' },
              { n: '03', title: 'Innovation', desc: 'Repenser nos approches pour relever les défis complexes d\'aujourd\'hui avec les outils de demain.' },
              { n: '04', title: 'Excellence', desc: 'Nous visons le plus haut standard dans tout ce que nous entreprenons, sans exception.' },
            ].map((v, i) => (
              <li
                key={v.n}
                className={`card p-8 relative overflow-hidden flex flex-col justify-between min-h-[200px] animate-fade-in-up animate-delay-${(i + 1) * 100}`}
              >
                <span className="absolute top-4 right-5 text-4xl font-black text-[var(--bg-elevated)] leading-none font-display select-none pointer-events-none">{v.n}</span>
                <div>
                  <h3 className="font-display text-base font-extrabold text-[var(--text-primary)] mb-2.5 uppercase tracking-tight">{v.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">{v.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-6 max-w-[1200px] mx-auto text-center flex flex-col items-center relative">
        <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight leading-[1.05] text-[var(--text-primary)] mb-4 uppercase">Prêt(e) à rejoindre le mouvement ?</h2>
        <p className="text-[var(--text-muted)] mb-10 max-w-[500px] mx-auto text-xs md:text-sm leading-relaxed font-medium">
          Crée ton profil, partage ton savoir et grandis avec la communauté Ayibuzz.
        </p>
        <div className="flex gap-4 justify-center flex-wrap items-center">
          
          <Link
            href="/events"
            className="btn-primary no-underline inline-flex items-center gap-2 py-3 px-8 text-sm"
          >
            <span>Explorer les événements</span>
            <ArrowRight size={16} />
          </Link>

          <Link 
            href="/speakers" 
            className="btn-secondary no-underline inline-flex items-center gap-2 py-3 px-8 text-sm"
          >
            <span>Découvrir les voix</span>
            <ArrowUpRight size={16} />
          </Link>

        </div>
      </section>
    </div>
  );
}
