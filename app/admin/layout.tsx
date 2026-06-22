'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useAdminLayoutStore } from '@/store/adminLayoutStore';
import {
  LayoutDashboard, Calendar, Users, Ticket, ClipboardList,
  LogOut, Menu, X, ChevronRight, ChevronLeft, List, Mail,
  Search, Megaphone, FileText, Scan, RefreshCw, Heart
} from 'lucide-react';

// Configuration des items pour la section "Gestion"
const gestionItems = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/events', label: 'Événements', icon: Calendar },
  { href: '/admin/reservations', label: 'Réservations', icon: ClipboardList },
  { href: '/admin/sessions', label: 'Sessions', icon: List },
  { href: '/admin/speakers', label: 'Intervenants', icon: Users },
  { href: '/admin/speaker-applications', label: 'Candidatures', icon: FileText },
  { href: '/admin/tickets', label: 'Billets', icon: Ticket },
  { href: '/admin/sponsors', label: 'Sponsors', icon: Heart },
];

// Configuration des items pour la section "Outils"
const outilsItems = [
  { href: '/admin/emails', label: 'Boîte d\'envoi', icon: Mail },
  { href: '/admin/emails/campaigns', label: 'Campagnes', icon: Megaphone },
  { href: '/admin/emails/templates', label: 'Modèles d\'emails', icon: FileText },
  { href: '/admin/scanner', label: 'Scanner de billets', icon: Scan },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [timeString, setTimeString] = useState('');

  // Accès au store global du layout
  const { 
    searchQuery, 
    setSearchQuery, 
    activeFilter, 
    setActiveFilter,
    selectedSession,
    isDrawerOpen,
    closeDrawer,
    validationModal,
    isValidationModalOpen,
    closeValidationModal
  } = useAdminLayoutStore();

  // Chargement de l'état de rétraction depuis le localStorage côté client
  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  // Synchronisation de la session Supabase et hydratation du store d'authentification
  useEffect(() => {
    const syncSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const isSystemAdmin = session.user.email?.toLowerCase() === 'admin@uplift.io' || session.user.user_metadata?.role === 'admin';
        useAuthStore.getState().login({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Admin',
          email: session.user.email || '',
          role: isSystemAdmin ? 'admin' : 'attendee'
        });
      }
      setMounted(true);
    };
    syncSession();
  }, []);

  // Horloge dynamique pour le greeting dans le header
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const date = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const formattedDate = date.charAt(0).toUpperCase() + date.slice(1);
      setTimeString(`Il est ${time} · ${formattedDate}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Garde de rôle : redirection si non admin
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'admin')) {
      router.replace('/auth/login');
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated || user?.role !== 'admin') return null;

  const handleLogout = async () => { 
    const supabase = createClient();
    await supabase.auth.signOut();
    logout(); 
    router.push('/'); 
  };

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('admin-sidebar-collapsed', String(nextState));
  };

  // Rendu de la liste des liens de navigation
  const renderNavLinks = (items: typeof gestionItems, isMobileSidebar: boolean = false) => {
    return items.map(({ href, label, icon: Icon }) => {
      const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
      return (
        <Link 
          key={href} 
          href={href} 
          className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 relative group
            ${isActive 
              ? 'bg-[#E0E7FF] text-[#0E1AD4] border-black shadow-[2px_2px_0px_0px_#000000] translate-x-[-2px] translate-y-[-2px]' 
              : 'bg-transparent text-slate-300 border-transparent hover:bg-white/5 hover:text-[#E0E7FF]'
            }
            ${isCollapsed && !isMobileSidebar ? 'justify-center' : 'justify-start'}
          `}
          onClick={() => setSidebarOpen(false)}
        >
          <Icon size={20} className="flex-shrink-0" />
          <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap font-semibold text-sm
            ${isCollapsed && !isMobileSidebar ? 'w-0 opacity-0 pointer-events-none' : 'w-auto opacity-100 ml-3'}
          `}>
            {label}
          </span>
          {/* Tooltip lorsque la barre latérale est rétractée */}
          {isCollapsed && !isMobileSidebar && (
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#0F172A] text-[#F8FAFC] text-xs font-bold rounded-lg border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-[2px_2px_0px_0px_#000000]">
              {label}
            </div>
          )}
        </Link>
      );
    });
  };

  // Contenu réutilisable de la Sidebar
  const SidebarContent = ({ isMobileSidebar = false }) => (
    <div className={`h-full flex flex-col justify-between ${isMobileSidebar ? 'p-6 bg-[#0F172A]' : 'p-5'}`}>
      <div>
        {/* Header de la Sidebar (Logo Ayibuzz & Contrôle de collapse) */}
        <div className={`flex items-center justify-between mb-8 relative ${isCollapsed && !isMobileSidebar ? 'justify-center' : ''}`}>
          <Link href="/" className="flex items-center gap-3 overflow-hidden select-none">
            <img src="/logo-ayibuzz.png" alt="Ayibuzz Media" className="h-8 w-auto flex-shrink-0 object-contain" />
            {(!isCollapsed || isMobileSidebar) && (
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-[#F8FAFC] text-lg tracking-tight leading-none">Ayibuzz</span>
                <span className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase mt-0.5">Admin</span>
              </div>
            )}
          </Link>

          {/* Bouton de collapse pour Desktop */}
          {!isMobileSidebar && (
            <button
              onClick={toggleCollapse}
              className="absolute -right-7 top-1/2 -translate-y-1/2 z-50 bg-[#0E1AD4] text-white border-2 border-black rounded-full p-1 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
              style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}
              title={isCollapsed ? 'Déplier la barre' : 'Replier la barre'}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
        </div>

        {/* Section de Navigation "Gestion" */}
        <nav className="mb-6">
          {(!isCollapsed || isMobileSidebar) && (
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-3 mb-3 font-mono">Gestion</p>
          )}
          <div className="flex flex-col gap-1.5">
            {renderNavLinks(gestionItems, isMobileSidebar)}
          </div>
        </nav>

        {/* Section de Navigation "Outils" */}
        <nav>
          {(!isCollapsed || isMobileSidebar) && (
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-3 mb-3 font-mono">Outils</p>
          )}
          <div className="flex flex-col gap-1.5">
            {renderNavLinks(outilsItems, isMobileSidebar)}
          </div>
        </nav>
      </div>

      {/* Profil de l'utilisateur & Déconnexion en bas */}
      <div className="border-t border-white/10 pt-5 mt-8 flex flex-col gap-4">
        <div className={`flex items-center gap-3 relative group ${isCollapsed && !isMobileSidebar ? 'justify-center' : 'px-2'}`}>
          <div className="w-9 h-9 rounded-lg border-2 border-black bg-[#C9B8E8] text-black font-mono font-bold flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_#000000]">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          {(!isCollapsed || isMobileSidebar) && (
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-sm text-[#F5F0E8] truncate leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
            </div>
          )}
          {isCollapsed && !isMobileSidebar && (
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#0D0D11] text-[#F5F0E8] text-xs font-bold rounded-lg border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-[2px_2px_0px_0px_#000000]">
              <p className="font-extrabold">{user?.name}</p>
              <p className="text-slate-400 font-mono mt-0.5">{user?.email}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`flex items-center p-3 rounded-lg border-2 border-transparent text-[#F4A7B9] hover:bg-red-500/10 hover:border-[#F4A7B9] transition-all duration-200 cursor-pointer
            ${isCollapsed && !isMobileSidebar ? 'justify-center' : 'justify-start'}
          `}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap font-bold text-sm
            ${isCollapsed && !isMobileSidebar ? 'w-0 opacity-0 pointer-events-none' : 'w-auto opacity-100 ml-3'}
          `}>
            Déconnexion
          </span>
        </button>
      </div>
    </div>
  );

  // Chips de filtres pour le Header
  const filterChips = [
    { label: 'Tout', value: 'Tout', color: 'bg-[#E2E8F0] text-[#0F172A]' },
    { label: 'Confirmé', value: 'Confirmé', color: 'bg-[#E0E7FF] text-[#0E1AD4]' },
    { label: 'En attente', value: 'En attente', color: 'bg-[#F1F5F9] text-[#334155]' },
    { label: 'Annulé', value: 'Annulé', color: 'bg-white text-slate-400' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#E0E7FF] selection:text-[#0E1AD4]">
      {/* 1. Sidebar Desktop */}
      <aside 
        className={`hidden md:block bg-[#0F172A] border-r-4 border-black transition-all duration-300 ease-in-out relative z-30 flex-shrink-0
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* 2. Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0F172A] border-b-4 border-black z-40 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo-ayibuzz.png" alt="Ayibuzz" className="h-7 w-auto" />
          <span className="font-display font-extrabold text-[#F8FAFC] text-base tracking-tight">Ayibuzz Admin</span>
        </Link>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="p-1.5 border-2 border-black bg-[#0E1AD4] text-white rounded-lg shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* 3. Sidebar Mobile (Slide-over) */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 pt-16 bg-[#0F172A]/90 backdrop-blur-md overflow-y-auto">
          <SidebarContent isMobileSidebar />
        </div>
      )}

      {/* 4. Zone de Contenu Principal (Main Section) */}
      <main className="flex-1 min-w-0 flex flex-col md:pt-0 pt-16">
        <div className="p-4 md:p-8 max-w-7xl w-full mx-auto flex-1 flex flex-col">
          
          {/* Header Global du Dashboard */}
          <header className="flex flex-col gap-5 mb-8 border-4 border-black bg-white rounded-[18px] p-6 shadow-[6px_6px_0px_0px_#000000]">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight text-black">
                  Bonjour, {user?.name?.split(' ')[0] || 'Admin'} ! 👋
                </h1>
                <p className="text-xs md:text-sm text-[#64748B] font-bold font-mono mt-1">
                  {timeString}
                </p>
              </div>
              
              {/* Barre de Recherche Globale */}
              <div className="relative w-full lg:w-96">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un inscrit, un événement..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-black rounded-lg bg-[#F8FAFC] text-black font-semibold placeholder-slate-500 focus:outline-none focus:bg-white transition-all shadow-[2px_2px_0px_0px_#000000] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px]"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={18} />
              </div>
            </div>
            
            {/* Chips de filtres de catégories */}
            <div className="flex flex-wrap items-center gap-2 border-t-2 border-slate-100 pt-4 mt-1">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mr-2 font-mono">Filtres rapides :</span>
              {filterChips.map((chip) => {
                const isSelected = activeFilter === chip.value;
                return (
                  <button
                    key={chip.value}
                    onClick={() => setActiveFilter(chip.value)}
                    className={`border-2 border-black rounded-lg px-3 py-1.5 font-bold text-xs cursor-pointer transition-all duration-200 select-none
                      ${isSelected 
                        ? `${chip.color} shadow-[1px_1px_0px_0px_#000000] translate-y-[1px] translate-x-[1px]` 
                        : 'bg-white text-black shadow-[3px_3px_0px_0px_#000000] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none'
                      }
                    `}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </header>

          {/* Corps de Page Enfant */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </main>

      {/* 5. Session Drawer (Slide-over droit pour les détails de sessions) */}
      {isDrawerOpen && selectedSession && (
        <>
          {/* Overlay flouté */}
          <div 
            className="fixed inset-0 bg-black/45 z-45 backdrop-blur-xs transition-opacity duration-200" 
            onClick={closeDrawer}
          />
          
          {/* Panneau latéral */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#F8FAFC] border-l-4 border-black shadow-[-8px_0px_0px_0px_#000000] p-6 flex flex-col justify-between transition-transform duration-300 transform translate-x-0 animate-fade-in-up">
            <div>
              {/* Entête du tiroir */}
              <div className="flex justify-between items-center pb-4 border-b-2 border-black mb-6">
                <h2 className="font-display font-extrabold text-xl tracking-tight text-black">
                  Détails de la session
                </h2>
                <button 
                  onClick={closeDrawer}
                  className="p-1.5 border-2 border-black bg-white rounded-lg hover:bg-red-100 transition-colors shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
                >
                  <X size={18} className="text-black" />
                </button>
              </div>

              {/* Contenu principal */}
              <div className="flex flex-col gap-6 overflow-y-auto max-h-[72vh] pr-1">
                {/* Badge & Titre de session */}
                <div className="bg-white border-2 border-black rounded-[14px] p-4 shadow-[4px_4px_0px_0px_#000000]">
                  <span className="bg-[#E0E7FF] text-[#0E1AD4] border border-black rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono shadow-[1px_1px_0px_#000000]">
                    Session active
                  </span>
                  <h3 className="font-display font-extrabold text-lg mt-2 text-black leading-tight">
                    {selectedSession.name}
                  </h3>
                </div>

                {/* Métadonnées de session (Salle, horaire) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F1F5F9] border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_#000000]">
                    <p className="text-[9px] font-extrabold uppercase text-slate-500 tracking-widest font-mono">Salle / Lieu</p>
                    <p className="font-mono text-xs font-bold mt-1 text-black truncate">
                      {selectedSession.room || selectedSession.location_name || 'Non spécifié'}
                    </p>
                  </div>

                  <div className="bg-[#E0E7FF] text-[#0E1AD4] border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_#000000]">
                    <p className="text-[9px] font-extrabold uppercase text-indigo-700 tracking-widest font-mono">Horaire</p>
                    <p className="font-mono text-xs font-bold mt-1 text-[#0E1AD4] truncate">
                      {selectedSession.start_time || 'Non spécifié'} {selectedSession.end_time ? `- ${selectedSession.end_time}` : ''}
                    </p>
                  </div>
                </div>

                {/* Intervenant (Speaker) */}
                <div className="bg-white border-2 border-black rounded-[14px] p-4 shadow-[4px_4px_0px_0px_#000000]">
                  <p className="text-[9px] font-extrabold uppercase text-slate-500 tracking-widest mb-3 font-mono">Intervenant</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border-2 border-black bg-[#E2E8F0] flex items-center justify-center font-bold font-mono text-black shadow-[2px_2px_0px_0px_#000000] overflow-hidden flex-shrink-0">
                      {selectedSession.speaker?.avatar_url ? (
                        <img src={selectedSession.speaker.avatar_url} alt={selectedSession.speaker.name} className="w-full h-full object-cover" />
                      ) : (
                        selectedSession.speaker_name?.[0]?.toUpperCase() || selectedSession.speaker?.name?.[0]?.toUpperCase() || 'S'
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-black">
                        {selectedSession.speaker_name || selectedSession.speaker?.name || 'Intervenant UPLIFT'}
                      </h4>
                      <p className="text-xs text-slate-500 italic mt-0.5 truncate max-w-[200px]">
                        {selectedSession.speaker?.bio || 'Conférencier invité'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description de session */}
                {selectedSession.description && (
                  <div className="bg-white border-2 border-black rounded-[14px] p-4 shadow-[4px_4px_0px_0px_#000000]">
                    <p className="text-[9px] font-extrabold uppercase text-slate-500 tracking-widest mb-2 font-mono">Description</p>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      {selectedSession.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions du tiroir */}
            <div className="border-t-2 border-black pt-4 mt-6 flex gap-3">
              <button 
                onClick={closeDrawer}
                className="flex-1 py-2 px-4 border-2 border-black bg-white hover:bg-slate-50 text-black rounded-lg font-bold text-xs shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
              >
                Fermer
              </button>
              
              <Link
                href="/admin/sessions"
                onClick={closeDrawer}
                className="flex-1 py-2 px-4 border-2 border-black bg-[#0E1AD4] text-white hover:bg-[#0c16b3] rounded-lg font-bold text-xs text-center shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                Gérer les sessions
              </Link>
            </div>
          </div>
        </>
      )}

      {/* 6. Modal de Validation Globale (Validation Modal) */}
      {isValidationModalOpen && validationModal && (
        <>
          {/* Overlay flouté */}
          <div 
            className="fixed inset-0 bg-black/55 z-50 backdrop-blur-xs transition-opacity duration-200"
            onClick={closeValidationModal}
          />
          
          {/* Corps de la modal */}
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <div className="bg-[#F8FAFC] border-4 border-black rounded-[18px] w-full max-w-md p-6 shadow-[8px_8px_0px_0px_#000000] animate-fade-in-up">
              <h3 className="font-display font-extrabold text-xl text-black mb-3">
                {validationModal.title}
              </h3>
              
              <p className="text-sm text-slate-700 leading-relaxed font-semibold mb-6">
                {validationModal.message}
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeValidationModal}
                  className="px-4 py-2 border-2 border-black bg-white hover:bg-slate-50 text-black rounded-lg font-bold text-xs shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
                >
                  {validationModal.cancelText || 'Annuler'}
                </button>
                <button
                  onClick={() => {
                    validationModal.onConfirm();
                    closeValidationModal();
                  }}
                  className="px-4 py-2 border-2 border-black bg-[#0E1AD4] text-white hover:bg-[#0c16b3] rounded-lg font-bold text-xs shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
                >
                  {validationModal.confirmText || 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

