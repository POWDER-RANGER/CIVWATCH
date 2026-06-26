import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { alertsApi, analyticsApi, anomaliesApi, mlApi } from '../api/client';

/* =========================
   TYPES
========================= */

type Mode = 'all' | 'awareness' | 'transparency';

type EventPacket = {
  event_id: string;
  timestamp: string;
  geo?: { lat: number; lon: number };
  type?: string;
  severity?: number;
  source?: string;
  payload?: any;
};

/* =========================
   UTILS
========================= */

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function scoreColor(v?: number | null) {
  if (v == null || Number.isNaN(v)) return '#94a3b8';
  if (v > 0.75) return '#ef4444';
  if (v > 0.5) return '#f59e0b';
  return '#22c55e';
}

function format(n: number) {
  return new Intl.NumberFormat().format(n);
}

function Panel({ title, subtitle, children, action }: any) {
  return (
    <section className="card" style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, opacity: 0.5 }}>{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function MasterDashboardPage() {
  const [mode, setMode] = useState<Mode>('all');

  const [events, setEvents] = useState<EventPacket[]>([]);
  const [selected, setSelected] = useState<EventPacket | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  const [trend, setTrend] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [ml, setMl] = useState<any>({});

  useEffect(() => {
    let alive = true;

    Promise.allSettled([
      analyticsApi.trends(30),
      alertsApi.recent(),
      mlApi.health(),
      mlApi.ready(),
      mlApi.insights(),
    ]).then((res) => {
      if (!alive) return;

      const [t, a, h, r, i] = res;

      if (t.status === 'fulfilled') setTrend(t.value.data?.trends || []);
      if (a.status === 'fulfilled') setAlerts(a.value.data?.alerts || []);

      setMl({
        health: h.status === 'fulfilled' ? h.value.data?.status : 'unknown',
        ready: r.status === 'fulfilled' ? r.value.data?.ready : false,
        insights: i.status === 'fulfilled' ? i.value.data?.insights : [],
      });
    });

    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/events/stream');
    wsRef.current = ws;

    ws.onmessage = (msg) => {
      try {
        const ev: EventPacket = JSON.parse(msg.data);

        setEvents((prev) => [ev, ...prev].slice(0, 200));

        setTrend((prev) => {
          const today = new Date().toISOString().slice(0, 10);
          const last = prev[prev.length - 1];

          if (!last || last.day !== today) {
            return [...prev.slice(-29), { day: today, total: 1 }];
          }

          const updated = [...prev];
          updated[updated.length - 1] = {
            ...last,
            total: (last.total || 0) + 1,
          };

          return updated;
        });
      } catch {}
    };

    return () => ws.close();
  }, []);

  const critical = useMemo(() => events.filter(e => (e.severity || 0) >= 0.7), [events]);

  const filtered = useMemo(() => {
    if (mode === 'all') return events;
    if (mode === 'awareness') return events.filter(e => /alert|weather|hazard|incident/i.test(e.type || ''));
    return events.filter(e => /finance|vote|bill|lobby/i.test(e.type || ''));
  }, [events, mode]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div className="card">
          <div style={{ fontSize: 12, opacity: 0.6 }}>CIVWATCH SOC CONSOLE</div>
          <h2>Unified Real-Time Intelligence Surface</h2>

          <div style={{ display: 'flex', gap: 8 }}>
            {(['all','awareness','transparency'] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}>{m}</button>
            ))}
          </div>
        </div>

        <Panel title="Live ingestion flux">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area dataKey="total" stroke="#22c55e" fill="#22c55e33" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Event stream">
          <div style={{ maxHeight: 320, overflow: 'auto' }}>
            {filtered.map(ev => (
              <div key={ev.event_id} onClick={() => setSelected(ev)} style={{ borderLeft: `3px solid ${scoreColor(ev.severity)}` }}>
                <div>{ev.type}</div>
                <div>{ev.timestamp}</div>
              </div>
            ))}
          </div>
        </Panel>

      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <Panel title="Inspector">
          {selected ? <pre>{JSON.stringify(selected, null, 2)}</pre> : <div>No selection</div>}
        </Panel>

        <Panel title="ML status">
          <div>{ml.health}</div>
          <div>{String(ml.ready)}</div>
        </Panel>

        <Panel title="Critical">
          {critical.map((e, i) => (
            <div key={i}>{e.type} ({e.severity})</div>
          ))}
        </Panel>

      </div>

    </div>
  );
}
