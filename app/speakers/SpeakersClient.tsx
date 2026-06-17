'use client';
import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const TwitterIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

interface Speaker {
  id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  avatar: string;
  twitter?: string;
  linkedin?: string;
  // Distingue les intervenants de la table principale vs les candidatures
  source: 'speakers' | 'applications';
}

export default function SpeakersClient({ initialSpeakers }: { initialSpeakers: Speaker[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSpeakers = initialSpeakers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative overflow-hidden w-full bg-[var(--bg-base)]">
      {/* Floating background orbs */}
      <div className="orb animate-float w-[700px] h-[700px] bg-[rgba(0,24,255,0.06)] -top-[200px] -right-[150px] [animation-duration:8s]"></div>
      <div className="orb animate-float w-[400px] h-[400px] bg-[rgba(0,194,255,0.04)] top-[40%] -left-[100px] [animation-duration:10s] [animation-delay:2s]"></div>

      <section className="max-w-[1200px] mx-auto px-6 py-20 relative z-10">
        <div className="text-center max-w-[800px] mx-auto">
          <div className="badge badge-primary inline-flex mb-4">Partager le Savoir</div>
          <h1 className="font-display text-4xl md:text-6.5xl font-black text-[var(--text-primary)] mb-6 tracking-tight leading-[1.05] uppercase animate-fade-in-up">
            Nos <span className="text-[var(--brand-accent)]">Intervenants</span>
          </h1>
          <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed mb-10 max-w-[650px] mx-auto font-medium animate-fade-in-up animate-delay-100">
            Rencontrez les leaders d&apos;opinion et les experts qui façonneront l&apos;avenir lors d&apos;Ayibuzz Media. Des visionnaires prêts à partager leur expérience.
          </p>
          
          <div className="glass rounded-2xl p-2 flex items-center gap-2 max-w-[500px] mx-auto shadow-sm animate-fade-in-up animate-delay-200">
            <Search size={20} className="text-[var(--text-muted)] ml-2" />
            <input 
              type="text" 
              placeholder="Rechercher un intervenant..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none py-3 px-1 text-base text-[var(--text-primary)] outline-none"
            />
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 py-20 relative z-10">
        {filteredSpeakers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg md:text-xl text-[var(--text-secondary)] font-medium animate-fade-in-up">Aucun intervenant ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredSpeakers.map((speaker, index) => (
              <div 
                key={speaker.id} 
                className={`card animate-fade-in-up p-0 overflow-hidden h-full flex flex-col animate-delay-${((index % 5) + 1) * 100}`}
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image 
                    src={speaker.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${speaker.name}`} 
                    alt={speaker.name} 
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                    {speaker.linkedin && (
                      <a 
                        href={speaker.linkedin.startsWith('http') ? speaker.linkedin : `https://linkedin.com/in/${speaker.linkedin}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="glass w-9 h-9 rounded-xl flex items-center justify-center text-[var(--brand-accent)] border border-[var(--border-default)] hover:bg-[var(--brand-accent)] hover:text-white transition-colors duration-300"
                      >
                        <LinkedinIcon size={18} />
                      </a>
                    )}
                    {speaker.twitter && (
                      <a 
                        href={speaker.twitter.startsWith('http') ? speaker.twitter : `https://twitter.com/${speaker.twitter.replace('@', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="glass w-9 h-9 rounded-xl flex items-center justify-center text-[var(--brand-accent)] border border-[var(--border-default)] hover:bg-[var(--brand-accent)] hover:text-white transition-colors duration-300"
                      >
                        <TwitterIcon size={18} />
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg md:text-xl font-extrabold text-[var(--text-primary)] mb-1">{speaker.name}</h3>
                  <p className="text-sm font-semibold text-[var(--brand-primary)] mb-0.5">{speaker.title}</p>
                  <p className="text-xs text-[var(--text-muted)] mb-4">{speaker.company}</p>
                  
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 line-clamp-3 font-medium">
                    {speaker.bio}
                  </p>
                  
                  <div className="mt-auto">
                    {/* Lien de profil uniquement disponible pour la table speakers */}
                    {speaker.source === 'speakers' && (
                      <Link 
                        href={`/speakers/${speaker.id}`} 
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--brand-accent)] hover:text-[var(--brand-primary)] transition-colors no-underline group/link"
                      >
                        Voir le profil <span className="transition-transform duration-200 group-hover/link:translate-x-0.5">→</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
