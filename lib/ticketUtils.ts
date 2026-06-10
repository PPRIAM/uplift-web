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
 * Calculates reservation and ticket capacity statistics for an event.
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
