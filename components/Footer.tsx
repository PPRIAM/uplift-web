import Link from 'next/link';
import Image from 'next/image';
import NewsletterForm from '@/components/NewsletterForm';
import DynamicSponsors from '@/components/DynamicSponsors';

// Composant Footer refondu selon le design UPLIFT 2.0
// Rendu côté serveur pour optimiser le chargement et éliminer le Layout Shift (CLS = 0)
export default function Footer() {
  return (
    <footer className="bg-white border-t-[1.5px] border-[#0F172A] pt-0 pb-8 font-body">
      {/* Section Sponsors Dynamique (chargée côté serveur) */}
      <DynamicSponsors />

      <div className="max-w-[1200px] mx-auto px-6 pt-16">
        
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
                className="object-contain w-auto h-auto" 
                src="/logo.png"
              />
            </Link>
            <p className="text-[#334155] text-base leading-[1.6] font-medium">
              Nous structurons l&apos;avenir numérique haïtien. Unir et propulser l&apos;écosystème professionnel local.
            </p>
          </div>

          {/* Bloc de droite : Formulaire d'inscription (Resend) */}
          <NewsletterForm />
          
        </div>

        {/* Barre de pied de page avec séparateur franc */}
        <div className="border-t-[1.5px] border-[#0F172A]/10 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#64748B] text-sm font-medium">
            © 2026 AYIBUZZ MÉDIA. Tous droits réservés.
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
