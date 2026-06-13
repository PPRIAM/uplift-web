export interface TicketStats {
  daysUntil: number;
  expandedTicketsSold: number;
  expandedTicketsCapacity: number;
  baseSold: number;
  standardPoolRemaining: number;
  spotsLeft: number;
  effectiveTotalCapacity: number;
  fillPct: number;
}

export interface EventForStats {
  date_time: string;
  registered_count: number;
  capacity: number;
}

export interface TicketForStats {
  allocation_mode: string;
  sold: number;
  quantity: number;
}

/**
 * Calcule les statistiques de réservation et de capacité de billets pour un événement.
 */
export function calculateTicketStats(event: EventForStats, tickets: TicketForStats[]): TicketStats {
  const daysUntil = Math.max(
    0,
    Math.floor((new Date(event.date_time).getTime() - new Date().getTime()) / 86400000)
  );

  const expandedTicketsSold = tickets
    .filter((t) => t.allocation_mode === 'expanded')
    .reduce((sum, t) => sum + t.sold, 0);

  const expandedTicketsCapacity = tickets
    .filter((t) => t.allocation_mode === 'expanded')
    .reduce((sum, t) => sum + t.quantity, 0);

  const baseSold = event.registered_count - expandedTicketsSold;
  const standardPoolRemaining = Math.max(0, event.capacity - baseSold);

  const spotsLeft =
    standardPoolRemaining +
    tickets
      .filter((t) => t.allocation_mode === 'expanded')
      .reduce((sum, t) => sum + Math.max(0, t.quantity - t.sold), 0);

  const effectiveTotalCapacity = event.capacity + expandedTicketsCapacity;
  const fillPct =
    effectiveTotalCapacity > 0
      ? Math.round((event.registered_count / effectiveTotalCapacity) * 100)
      : 0;

  return {
    daysUntil,
    expandedTicketsSold,
    expandedTicketsCapacity,
    baseSold,
    standardPoolRemaining,
    spotsLeft,
    effectiveTotalCapacity,
    fillPct,
  };
}

/**
 * Génère un code de billet unique basé sur les initiales de l'utilisateur.
 */
export function generateTicketCode(initials: string): string {
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `UP-${initials}-${randomStr}`;
}

/**
 * Formate le prix d'un billet selon sa devise.
 */
export function formatPrice(price: number, currency: string | null | undefined): string {
  if (price === 0) return 'Gratuit';
  const curr = currency === 'HTG' ? 'HTG' : 'USD';
  if (curr === 'HTG') {
    return `${price.toLocaleString('fr-HT')} HTG`;
  }
  return `$${price}`;
}

