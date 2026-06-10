'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ChevronDown, LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasLiveEvent, setHasLiveEvent] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkLiveEvents = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('events')
        .select('id')
        .eq('published', true)
        .eq('is_live', true)
        .limit(1);
      setHasLiveEvent(!!data && data.length > 0);
    };
    checkLiveEvents();
    const interval = setInterval(checkLiveEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/events', label: 'Événements' },
    { href: '/speakers', label: 'Intervenants' },
    ...(hasLiveEvent ? [{ href: '/live', label: '🔴 En direct' }] : []),
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    logout();
    setDropdownOpen(false);
    setMenuOpen(false);
    router.push('/');
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-strong border-b border-[var(--border-subtle)] shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between h-[72px]">
            
            <Link className="flex items-center no-underline" href="/">
              <Image
                src="/logo.png"
                alt="UPLIFT 2.0"
                width={120}
                height={36}
                style={{ filter: 'brightness(0) saturate(100%) invert(12%) sepia(95%) saturate(5833%) hue-rotate(242deg) brightness(88%) contrast(99%)' }}
                className="text-transparent object-contain w-auto h-auto"
                priority
              />
            </Link>

            {/* Liens de navigation pour ordinateurs */}
            <div className="hide-mobile flex items-center gap-1 font-body">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const isLive = link.href === '/live';
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-[6px] text-sm font-semibold no-underline transition-all duration-200 flex items-center gap-2 ${
                      isActive 
                        ? 'text-[#0E1AD4] bg-[#0E1AD4]/10' 
                        : 'text-[#334155] hover:text-[#0E1AD4] hover:bg-[#0E1AD4]/5'
                    }`}
                  >
                    {isLive ? (
                      <span className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                        </span>
                        <span className="text-red-600 font-bold uppercase tracking-wider text-xs">Direct</span>
                      </span>
                    ) : (
                      link.label
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Section d'authentification pour ordinateurs */}
            <div className="hide-mobile flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="btn-primary no-underline text-sm py-[9px] px-5 flex items-center gap-2"
                  >
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
                      {user.name[0].toUpperCase()}
                    </div>
                    <span>{user.name.split(' ')[0]}</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute top-[calc(100%+8px)] right-0 w-52 bg-white border border-[#0F172A] rounded-[12px] p-1.5 shadow-[4px_4px_0px_#0F172A] z-50 animate-fade-in">
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-sm font-semibold text-[#0E1AD4] hover:bg-[#0E1AD4]/5 no-underline transition-colors"
                        >
                          <LayoutDashboard size={15} /> Dashboard
                        </Link>
                      )}
                      <Link
                        href="/my-reservations"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-sm font-semibold text-[#334155] hover:bg-[#0E1AD4]/5 no-underline transition-colors"
                      >
                        <User size={15} /> Mes réservations
                      </Link>
                      <div className="h-px bg-slate-200 my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[6px] text-sm font-semibold text-red-600 hover:bg-red-50 bg-transparent border-none cursor-pointer text-left transition-colors"
                      >
                        <LogOut size={15} /> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link 
                    className="btn-ghost no-underline text-sm font-semibold text-[#334155] hover:text-[#0E1AD4]" 
                    href="/auth/login"
                  >
                    Se connecter
                  </Link>
                  <Link 
                    className="btn-primary no-underline text-sm py-[9px] px-5" 
                    href="/auth/register"
                  >
                    S&#x27;inscrire
                  </Link>
                </>
              )}
            </div>

            {/* Bouton de menu mobile */}
            <button 
              className="hide-desktop btn-ghost p-2 flex items-center justify-center text-[#334155] hover:text-[#0E1AD4]" 
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

          </div>
        </div>
      </nav>

      {/* Menu mobile rétractable */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#F8FAFC] pt-[72px] flex flex-col animate-fade-in">
          <div className="flex flex-col px-6 py-8 gap-2 font-body">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const isLive = link.href === '/live';
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-[12px] text-base font-semibold no-underline transition-colors ${
                    isActive 
                      ? 'text-[#0E1AD4] bg-[#0E1AD4]/10' 
                      : 'text-[#334155] hover:text-[#0E1AD4] hover:bg-[#0E1AD4]/5'
                  }`}
                >
                  {isLive ? (
                    <span className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                      </span>
                      <span className="text-red-600 font-bold uppercase tracking-wider text-xs">Direct</span>
                    </span>
                  ) : (
                    link.label
                  )}
                </Link>
              );
            })}

            <div className="h-px bg-slate-200 my-4" />

            {isAuthenticated && user ? (
              <div className="flex flex-col gap-2">
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-[12px] text-base font-semibold text-[#0E1AD4] no-underline hover:bg-[#0E1AD4]/5"
                  >
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                )}
                <Link
                  href="/my-reservations"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-[12px] text-base font-semibold text-[#334155] no-underline hover:bg-[#0E1AD4]/5"
                >
                  <User size={18} /> Mes réservations
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-[12px] text-base font-semibold text-red-600 hover:bg-red-50 bg-transparent border-none cursor-pointer text-left transition-colors"
                >
                  <LogOut size={18} /> Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="btn-secondary text-center no-underline py-3 px-[28px]"
                >
                  Se connecter
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary text-center no-underline py-3 px-[28px]"
                >
                  S&#x27;inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
