/**
 * Utilitaires pour le traitement et la manipulation des images.
 * Tous les commentaires sont en français pour respecter les consignes du projet.
 */

/**
 * Nettoie l'URL d'une image en supprimant le protocole et le nom d'hôte local (localhost ou 127.0.0.1)
 * afin de la convertir en chemin relatif. Cela permet de contourner les restrictions Next.js
 * pour les images locales en développement.
 *
 * @param url L'URL de l'image à nettoyer (peut être absolue ou relative)
 * @returns L'URL nettoyée sous forme de chemin relatif ou inchangée si elle n'est pas locale
 */
export function sanitizeImageUrl(url: string | null | undefined): string {
  if (!url) return '';

  // Supprime "http://localhost:3000" ou "http://127.0.0.1:3000" (ou versions https) au début de l'URL
  return url
    .replace(/^https?:\/\/localhost:3000\//, '/')
    .replace(/^https?:\/\/127.0.0.1:3000\//, '/');
}
