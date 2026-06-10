'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

// Composant Footer refondu selon le design UPLIFT 2.0
export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Gestion de la soumission du formulaire de newsletter
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-white border-t-[1.5px] border-[#0F172A] pt-16 pb-8 font-body">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Section principale avec disposition en grille asymétrique */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          
          {/* Bloc de gauche : Logo et Manifeste de marque */}
          <div className="max-w-[350px]">
            <Link className="flex items-center no-underline mb-4" href="/">
              <Image 
                alt="UPLIFT 2.0" 
                loading="lazy" 
                width={140} 
                height={40} 
                style={{ filter: 'brightness(0) saturate(100%) invert(12%) sepia(95%) saturate(5833%) hue-rotate(242deg) brightness(88%) contrast(99%)' }}
                className="text-transparent object-contain w-auto h-auto" 
                src="/logo.png"
              />
            </Link>
            <p className="text-[#334155] text-base leading-[1.6] font-medium">
              Nous structurons l&apos;avenir numérique haïtien. Unir et propulser l&apos;écosystème professionnel local.
            </p>
          </div>

          {/* Bloc de droite : Formulaire d'inscription (Resend) */}
          <div className="w-full md:max-w-[450px]">
            <h4 className="text-[15px] font-bold uppercase tracking-[0.05em] text-[#334155] mb-3 font-heading">
              Inscription à la Newsletter
            </h4>
            <p className="text-[#64748B] text-sm mb-4 leading-relaxed">
              Recevez nos actualités et restez connecté avec l&apos;élan technologique d&apos;UPLIFT.
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse e-mail" 
                className="input-field flex-1 py-3 px-4 text-sm outline-none bg-[#F8FAFC] border-[1.5px] border-[#0F172A] rounded-[6px] text-[#0F172A] placeholder:text-[#64748B]" 
                required
              />
              <button 
                type="submit"
                className="btn-primary py-3 px-6 text-sm font-semibold whitespace-nowrap"
              >
                {subscribed ? 'Inscrit !' : "S'abonner"}
              </button>
            </form>
          </div>
          
        </div>

        {/* Barre de pied de page avec séparateur franc */}
        <div className="border-t-[1.5px] border-[#0F172A]/10 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#64748B] text-sm font-medium">
            © 2026 UPLIFT. Tous droits réservés.
          </p>
          
          <div className="flex gap-6">
            <Link href="/terms" className="text-[#64748B] hover:text-[#0E1AD4] text-sm font-semibold no-underline transition-colors duration-200">
              Conditions
            </Link>
            <Link href="/privacy" className="text-[#64748B] hover:text-[#0E1AD4] text-sm font-semibold no-underline transition-colors duration-200">
              Confidentialité
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
