'use client';
import { analyticsData, events, tickets } from '@/lib/mockData';
import { TrendingUp, DollarSign, Users, Calendar, Award } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const maxRevenue = Math.max(...analyticsData.revenueByMonth.map(m => m.revenue));

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="font-display" style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '4px' }}>Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Platform-wide performance metrics</p>
      </div>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {[
          { icon: DollarSign, label: 'Total Revenue', value: `$${analyticsData.totalRevenue.toLocaleString()}`, sub: '+18.2% this month', color: 'var(--brand-primary)' },
          { icon: Users, label: 'Total Attendees', value: analyticsData.totalAttendees.toLocaleString(), sub: '+12.5% this month', color: 'var(--brand-success)' },
          { icon: Calendar, label: 'Reservations', value: analyticsData.totalReservations.toLocaleString(), sub: '+9.1% this month', color: 'var(--brand-warning)' },
          { icon: Award, label: 'Conversion Rate', value: '74.3%', sub: 'Visits to bookings', color: 'var(--brand-secondary)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.color}20`, border: `1px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <s.icon size={18} color={s.color} />
            </div>
            <p style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>{s.value}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.label}</p>
            <p style={{ fontSize: '11px', color: 'var(--brand-success)', marginTop: '4px' }}>↑ {s.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Bar Chart */}
      <div className="stat-card" style={{ marginBottom: '28px' }}>
        <h3 className="font-display" style={{ fontSize: '17px', fontWeight: '700', marginBottom: '6px' }}>Monthly Revenue</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>Revenue trends over the past 7 months</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px' }}>
          {analyticsData.revenueByMonth.map((m, i) => {
            const heightPct = (m.revenue / maxRevenue) * 100;
            const isLast = i === analyticsData.revenueByMonth.length - 1;
            return (
              <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: isLast ? 'var(--gradient-brand)' : 'var(--bg-elevated)', border: `1px solid ${isLast ? 'transparent' : 'var(--border-subtle)'}`, width: '100%', borderRadius: '8px 8px 0 0', height: `${Math.max(heightPct, 3)}%`, position: 'relative', minHeight: '6px', transformOrigin: 'bottom', willChange: 'transform' }}>
                  <div style={{ position: 'absolute', top: '-22px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: isLast ? 'var(--brand-secondary)' : 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    ${(m.revenue / 1000).toFixed(0)}k
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: isLast ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: isLast ? '700' : '400' }}>{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Ticket Breakdown */}
        <div className="stat-card">
          <h3 className="font-display" style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>Ticket Type Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {analyticsData.ticketTypeBreakdown.map(t => (
              <div key={t.type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{t.type}</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{t.count.toLocaleString()} · {t.percent}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${t.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Events */}
        <div className="stat-card">
          <h3 className="font-display" style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>Top Events by Revenue</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {analyticsData.topEvents.slice(0, 5).map((ev, i) => {
              const pct = Math.round((ev.registeredCount / ev.capacity) * 100);
              return (
                <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: i === 0 ? 'var(--gradient-brand)' : 'var(--bg-card)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: i === 0 ? 'white' : 'var(--text-muted)', flexShrink: 0 }}>
                    #{i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '3px' }}>{ev.title}</p>
                    <div className="progress-bar" style={{ height: '4px' }}>
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--brand-secondary)', flexShrink: 0 }}>${ev.revenue.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
