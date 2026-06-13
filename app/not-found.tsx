'use client';

import Link from 'next/link';
import { ArrowLeft, Construction, HelpCircle } from 'lucide-react';

export default function NotFound() {
  const handleGoBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <div className="relative min-h-[75vh] flex items-center justify-center px-6 overflow-hidden bg-[var(--bg-base)]">
      {/* Background kinetic orbs */}
      <div className="orb animate-float w-[500px] h-[500px] bg-[rgba(14,26,212,0.04)] -top-[100px] -right-[100px] [animation-duration:12s]"></div>
      <div className="orb animate-float w-[350px] h-[350px] bg-[rgba(14,26,212,0.02)] -bottom-[50px] -left-[50px] [animation-duration:15s] [animation-delay:3s]"></div>

      <div className="max-w-[550px] w-full text-center relative z-10 animate-fade-in-up">
        {/* Badge */}
        <div className="badge badge-primary inline-flex mb-6 gap-2 py-1.5 px-4 bg-[var(--brand-accent)] text-white border-[var(--border-color)]">
          <HelpCircle size={14} className="animate-pulse" />
          <span className="font-extrabold tracking-wider">Erreur 404</span>
        </div>

        {/* Card Enclosure */}
        <div className="card bg-white p-8 md:p-12 text-center relative overflow-hidden flex flex-col border-[1.5px] border-[var(--border-color)] rounded-[24px] shadow-[8px_8px_0px_var(--border-color)] transition-all duration-300">
          
          {/* Construction Icon Indicator */}
          <div className="w-16 h-16 rounded-[20px] bg-[rgba(14,26,212,0.08)] border border-[rgba(14,26,212,0.15)] flex items-center justify-center mx-auto mb-6 relative">
            <Construction size={30} className="text-[var(--brand-accent)] animate-float" />
          </div>

          <h1 className="font-heading text-3xl md:text-4xl font-black text-[var(--text-primary)] mb-4 uppercase tracking-tight leading-none">
            En construction<br />
            <span className="text-[var(--brand-accent)]">ou Non construit,</span><br />
            qui sait ?
          </h1>

          <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-[400px] mx-auto mb-8 font-medium">
            La page que vous recherchez n&apos;existe pas encore ou a été déplacée. Notre équipe de bâtisseurs s&apos;active en arrière-plan.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGoBack}
              className="btn-primary no-underline inline-flex items-center gap-2 py-3.5 px-8 text-sm w-full sm:w-auto cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Retourner à la page précédente</span>
            </button>
            <Link
              href="/"
              className="btn-secondary no-underline inline-flex items-center gap-2 py-3.5 px-8 text-sm w-full sm:w-auto"
            >
              <span>Accueil</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
