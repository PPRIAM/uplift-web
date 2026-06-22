'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit, Trash2, Search, X,
  RefreshCw, Globe, ExternalLink,
  Upload, Link, Image as ImageIcon
} from 'lucide-react';
import {
  getSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  toggleSponsorActive
} from '@/app/actions/sponsor-actions';

// Interface pour typer un sponsor
interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editSponsor, setEditSponsor] = useState<Sponsor | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Formulaire local pour la création et la modification
  const [form, setForm] = useState({
    name: '',
    logo_url: '',
    website_url: '',
    is_active: true,
  });

  // États pour gérer le drag & drop et le mode de saisie de l'image
  const [dragActive, setDragActive] = useState(false);
  const [useManualUrl, setUseManualUrl] = useState(false);

  // Gère la lecture du fichier image sélectionné ou déposé
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (PNG, JPG, SVG, etc.).');
      return;
    }

    // Limite de taille optionnelle : 2 Mo pour éviter des chaînes Base64 trop volumineuses en base de données
    if (file.size > 2 * 1024 * 1024) {
      alert('Le fichier est trop lourd. Veuillez choisir une image de moins de 2 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setForm(prev => ({ ...prev, logo_url: result }));
    };
    reader.readAsDataURL(file);
  };

  // Gestionnaires pour le drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  // Récupère la liste des sponsors depuis les server actions
  const fetchSponsors = useCallback(async () => {
    setLoading(true);
    const res = await getSponsors();
    if (res.error) {
      alert(res.error);
    } else {
      setSponsors(res.data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

  // Filtre les sponsors selon le terme de recherche
  const filtered = sponsors.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Ouvre la modal pour ajouter un nouveau sponsor
  const openCreate = () => {
    setEditSponsor(null);
    setForm({
      name: '',
      logo_url: '',
      website_url: '',
      is_active: true,
    });
    setUseManualUrl(false);
    setShowModal(true);
  };

  // Ouvre la modal pour modifier un sponsor existant
  const openEdit = (sponsor: Sponsor) => {
    setEditSponsor(sponsor);
    const logoUrl = sponsor.logo_url || '';
    setForm({
      name: sponsor.name,
      logo_url: logoUrl,
      website_url: sponsor.website_url || '',
      is_active: sponsor.is_active,
    });
    // Si l'URL commence par "data:", c'est une image Base64 locale, on utilise le dropper
    // Sinon, on active le mode URL manuelle par défaut
    setUseManualUrl(logoUrl !== '' && !logoUrl.startsWith('data:'));
    setShowModal(true);
  };

  // Enregistre les modifications (création ou mise à jour)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!form.logo_url || !form.logo_url.trim()) {
      alert('Veuillez ajouter un logo (via fichier image ou URL).');
      return;
    }

    setActionLoading('save');
    let res;

    if (editSponsor) {
      res = await updateSponsor(editSponsor.id, form);
    } else {
      res = await createSponsor(form);
    }

    if (res.error) {
      alert(res.error);
    } else {
      await fetchSponsors();
      setShowModal(false);
    }
    setActionLoading(null);
  };

  // Active ou désactive un sponsor rapidement depuis la liste
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setActionLoading(id);
    const res = await toggleSponsorActive(id, currentStatus);
    if (res.error) {
      alert(res.error);
    } else {
      await fetchSponsors();
    }
    setActionLoading(null);
  };

  // Supprime définitivement un sponsor
  const handleDelete = async (id: string) => {
    setActionLoading(id);
    const res = await deleteSponsor(id);
    if (res.error) {
      alert(res.error);
    } else {
      setSponsors(prev => prev.filter(s => s.id !== id));
      setDeleteId(null);
    }
    setActionLoading(null);
  };

  return (
    <div className="flex-grow space-y-6">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-black">
            Gestion des Sponsors
          </h1>
          <p className="text-slate-500 text-sm font-semibold mt-1">
            {sponsors.length} sponsors enregistrés au total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSponsors}
            className="border-2 border-black bg-white text-black rounded-lg p-2.5 shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
            title="Actualiser la liste"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 border-2 border-black bg-[#0E1AD4] text-white rounded-lg px-4 py-2.5 font-bold shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
          >
            <Plus size={20} /> Ajouter un Sponsor
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative w-full max-w-md">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un sponsor par son nom..."
          className="w-full pl-10 pr-4 py-2.5 border-2 border-black rounded-lg bg-white text-black font-semibold placeholder-slate-500 focus:outline-none shadow-[2px_2px_0px_0px_#000000] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
      </div>

      {/* Rendu de la grille ou des placeholders de chargement */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="border-4 border-black bg-white rounded-[18px] p-12 text-center shadow-[6px_6px_0px_0px_#000000]">
          <p className="text-slate-500 font-bold text-lg">Aucun sponsor trouvé</p>
          <p className="text-slate-400 text-sm mt-1">Modifiez votre recherche ou ajoutez un nouveau sponsor ci-dessus.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(sponsor => (
            <div
              key={sponsor.id}
              className="border-4 border-black bg-white rounded-[18px] p-6 shadow-[6px_6px_0px_0px_#000000] flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#000000] transition-all"
            >
              <div>
                {/* Visualisation du Logo */}
                <div className="h-32 w-full border-2 border-black rounded-lg bg-slate-50 mb-4 flex items-center justify-center overflow-hidden relative">
                  {sponsor.logo_url ? (
                    <img
                      src={sponsor.logo_url}
                      alt={sponsor.name}
                      className="max-h-full max-w-full object-contain p-2"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Globe size={32} className="mx-auto text-slate-300 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Pas de logo</span>
                    </div>
                  )}
                  {/* Badge de statut */}
                  <span className={`absolute top-2 right-2 border-2 border-black rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono shadow-[1px_1px_0px_#000000]
                    ${sponsor.is_active
                      ? 'bg-[#E0E7FF] text-[#0E1AD4]'
                      : 'bg-slate-200 text-slate-500'
                    }
                  `}>
                    {sponsor.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                {/* Nom et Site Web */}
                <h3 className="font-display font-extrabold text-lg text-black leading-tight truncate">
                  {sponsor.name}
                </h3>
                {sponsor.website_url ? (
                  <a
                    href={sponsor.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#0E1AD4] font-bold hover:underline mt-1"
                  >
                    Site Web
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic block mt-1">Pas de site web renseigné</span>
                )}
              </div>

              {/* Barre d'actions du sponsor */}
              <div className="border-t-2 border-slate-100 pt-4 mt-6 flex justify-between items-center gap-2">
                <button
                  onClick={() => handleToggleActive(sponsor.id, sponsor.is_active)}
                  disabled={actionLoading === sponsor.id}
                  className={`flex items-center gap-2 border-2 border-black rounded-lg px-3 py-1.5 font-bold text-xs cursor-pointer shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50
                    ${sponsor.is_active
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }
                  `}
                >
                  {sponsor.is_active ? 'Désactiver' : 'Activer'}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(sponsor)}
                    className="border-2 border-black bg-white text-[#0E1AD4] rounded-lg p-2 shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                    title="Modifier le sponsor"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(sponsor.id)}
                    className="border-2 border-black bg-red-100 text-red-700 rounded-lg p-2 shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                    title="Supprimer le sponsor"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'ajout ou édition de sponsor */}
      {showModal && (
        <div className="fixed inset-0 bg-black/45 z-50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black rounded-[20px] p-6 w-full shadow-[8px_8px_0px_0px_#000000] animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b-2 border-black mb-6">
              <h3 className="font-display font-extrabold text-xl text-black">
                {editSponsor ? 'Modifier le Sponsor' : 'Ajouter un Sponsor'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 border-2 border-black bg-white rounded-lg hover:bg-slate-50 transition-colors shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-1.5 font-mono">
                  Nom du Sponsor *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Orange, Digicel, Sogebank"
                  className="w-full px-3 py-2 border-2 border-black rounded-lg bg-slate-50 text-black font-semibold focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 font-mono">
                    Logo du Sponsor *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setUseManualUrl(!useManualUrl);
                      setForm(prev => ({ ...prev, logo_url: '' }));
                    }}
                    className="text-xs font-bold text-[#0E1AD4] hover:underline flex items-center gap-1 font-mono cursor-pointer"
                  >
                    {useManualUrl ? (
                      <>
                        <Upload size={12} /> Utiliser le Glisser-Déposer
                      </>
                    ) : (
                      <>
                        <Link size={12} /> Saisir une URL
                      </>
                    )}
                  </button>
                </div>

                {useManualUrl ? (
                  /* Option URL manuelle */
                  <div className="space-y-2">
                    <input
                      type="url"
                      required
                      value={form.logo_url}
                      onChange={e => setForm({ ...form, logo_url: e.target.value })}
                      placeholder="Ex: https://example.com/logo.png"
                      className="w-full px-3 py-2 border-2 border-black rounded-lg bg-slate-50 text-black font-semibold focus:outline-none focus:bg-white"
                    />
                    <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                      Utile si le logo est déjà hébergé en ligne.
                    </p>
                  </div>
                ) : (
                  /* Zone de dépôt interactive (Drag & Drop) */
                  <div className="space-y-2">
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('logo-file-input')?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px]
                        ${dragActive
                          ? 'border-[#0E1AD4] bg-[#E0E7FF]/30 scale-[0.98]'
                          : 'border-black bg-slate-50 hover:bg-slate-100 hover:border-solid shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                        }
                      `}
                    >
                      <input
                        type="file"
                        id="logo-file-input"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {form.logo_url ? (
                        /* Aperçu de l'image chargée directement */
                        <div className="w-full flex flex-col items-center gap-2">
                          <div className="h-16 w-32 border border-black/10 rounded bg-white flex items-center justify-center overflow-hidden">
                            <img
                              src={form.logo_url}
                              alt="Aperçu"
                              className="max-h-full max-w-full object-contain p-1"
                            />
                          </div>
                          <span className="text-xs font-bold text-[#0E1AD4] hover:underline flex items-center gap-1 font-mono">
                            Remplacer l'image
                          </span>
                        </div>
                      ) : (
                        /* Message par défaut invitant au dépôt */
                        <div className="space-y-2">
                          <div className="mx-auto w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border border-black/10">
                            <Upload size={18} />
                          </div>
                          <div className="text-xs font-bold text-black">
                            Déposez le logo ici, ou <span className="text-[#0E1AD4] underline">parcourez</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            PNG, JPG, SVG ou GIF (Max. 2 Mo)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Aperçu du logo pour le mode URL manuelle */}
                {useManualUrl && form.logo_url && (
                  <div className="mt-2 border-2 border-black rounded-lg bg-slate-50 h-20 flex items-center justify-center overflow-hidden">
                    <img
                      src={form.logo_url}
                      alt="Aperçu du logo distant"
                      className="max-h-full max-w-full object-contain p-2"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-1.5 font-mono">
                  Site Web du Sponsor
                </label>
                <input
                  type="url"
                  value={form.website_url}
                  onChange={e => setForm({ ...form, website_url: e.target.value })}
                  placeholder="Ex: https://www.orange.com"
                  className="w-full px-3 py-2 border-2 border-black rounded-lg bg-slate-50 text-black font-semibold focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  className="w-5 h-5 border-2 border-black rounded bg-slate-50 accent-[#0E1AD4] cursor-pointer"
                />
                <label htmlFor="is_active" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                  Marquer comme actif et visible sur la plateforme
                </label>
              </div>

              <div className="flex gap-3 border-t-2 border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 px-4 border-2 border-black bg-white hover:bg-slate-50 text-black rounded-lg font-bold text-xs shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'save'}
                  className="flex-1 py-2 px-4 border-2 border-black bg-[#0E1AD4] text-white hover:bg-[#0c16b3] rounded-lg font-bold text-xs shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading === 'save' ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation de suppression */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/55 z-50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black rounded-[18px] w-full max-w-sm p-6 shadow-[8px_8px_0px_0px_#000000] animate-fade-in-up">
            <h3 className="font-display font-extrabold text-xl text-black mb-3">
              Supprimer le Sponsor ?
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-semibold mb-6">
              Cette action est irréversible. Êtes-vous sûr de vouloir supprimer définitivement ce sponsor de la liste ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border-2 border-black bg-white hover:bg-slate-50 text-black rounded-lg font-bold text-xs shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={actionLoading === deleteId}
                className="px-4 py-2 border-2 border-black bg-red-600 text-white hover:bg-red-700 rounded-lg font-bold text-xs shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading === deleteId ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
