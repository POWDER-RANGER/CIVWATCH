import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { OFFICIALS, LOBBYING, CHART_COLORS, ANOMALIES } from '../data/mockData';
import type { Official } from '../data/mockData';

type Tab = 'officials' | 'contributions' | 'lobbying' | 'anomalies';

const tooltipStyle = { backgroundColor: '#111009', border: '1px solid #3D3830', borderRadius: 0, fontFamily: "'IBM Plex Mono',monospace", fontSize: '11px', color: '#D8CFC0' };

function threatColor(n: number) { return n >= 80 ? CHART_COLORS.greenHi : n >= 50 ? CHART_COLORS.amber : CHART_COLORS.redHi; }
function partyColor(p: string) { return p === 'Democrat' ? '#2A6096' : p === 'Republican' ? '#C94040' : '#6B6358'; }

function OfficialCard({ official, onClick }: { official: Official; onClick: () => void }) {
  const scoreColor = threatColor(official.accountabilityScore);
  const promisePct = Math.round((official.promiseFulfilled / official.promiseTotal) * 100);
  return (
    <div onClick={onClick} style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)', padding: '24px', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--amber)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)' }>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div className="font-display" style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '1px', color: 'var(--text)' }}>{official.name}</div>
          <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>{official.title} · {official.state} · {official.chamber}</div>
        </div>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: partyColor(official.party) }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div><div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>ACCOUNTABILITY</div><div className="font-display" style={{ fontSize: '32px', fontWeight: 900, color: scoreColor }}>{official.accountabilityScore}</div></div>
        <div><div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>PROMISES</div><div className="font-display" style={{ fontSize: '32px', fontWeight: 900', color: 'var(--text)' }}>{promisePct}%</div></div>
      </div>
      <div className="font-mono" style={{ fontSize: '10px', color: 'var(--amber)', marginTop: '8px' }}>{official.topDonors[0].name} — ${official.topDonors[0].amount.toLocaleString()}</div>
    </div>
  );
}

function OfficialDetail({ official, onBack }: { official: Official; onBack: () => void }) {
  const scoreColor = threatColor(official.accountabilityScore);
  const promisePct = Math.round((official.promiseFulfilled / official.promiseTotal) * 100);
  const radarData = [
    { subject: 'Accountability', A: official.accountabilityScore },
    { subject: 'Promise Rate', A: promisePct },
    { subject: 'Donor Align', A: official.recentVotes.filter(v => v.alignedWithDonors === true).length * 25 },
    { subject: 'Transparency', A: official.topDonors.reduce((s, d) => s + d.amount, 0) / 5000 },
    { subject: 'Engagement', A: official.recentVotes.length * 20 },
  ];
  const voteData = official.recentVotes.map((v, i) => ({ name: `V${i + 1}`, aligned: v.alignedWithDonors === true ? 1 : v.alignedWithDonors === false ? -1 : 0, bill: v.bill, title: v.title, vote: v.vote }));
  return (
    <div>
      <button onClick={onBack} className="font-mono" style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '8px 16px', cursor: 'pointer', marginBottom: '20px', fontSize: '10px' }}>← Back</button>
      <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)', padding: '32px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div className="font-display" style={{ fontSize: '42px', fontWeight: 900, color: 'var(--text)' }}>{official.name}</div>
            <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-mid)', marginTop: '8px' }}>{official.title} · {official.state} · <span style={{ color: partyColor(official.party) }}>{official.party}</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>ACCOUNTABILITY SCORE</div>
            <div className="font-display" style={{ fontSize: '64px', fontWeight: 900, color: scoreColor }}>{official.accountabilityScore}</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)', padding: '20px' }}>
          <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '12px' }}>PERFORMANCE PROFILE</div>
          <ResponsiveContainer width="100%" height={250}><RadarChart data={radarData}><PolarGrid stroke="#2A2620" /><PolarAngleAxis dataKey="subject" tick={{ fill: '#6B6358', fontSize: 10 }} /><PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6B6358', fontSize: 9 }} axisLine={false} /><Radar dataKey="A" stroke="#B87D28" fill="#B87D28" fillOpacity={0.15} strokeWidth={2} /></RadarChart></ResponsiveContainer>
        </div>
        <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)', padding: '20px' }}>
          <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '12px' }}>VOTE ALIGNMENT VS DONORS</div>
          <ResponsiveContainer width="100%" height={250}><BarChart data={voteData}><CartesianGrid strokeDasharray="3 3" stroke="#2A2620" /><XAxis dataKey="name" tick={{ fill: '#6B6358', fontSize: 10 }} axisLine={{ stroke: '#2A2620' }} /><YAxis tick={{ fill: '#6B6358', fontSize: 10 }} domain={[-1.5, 1.5]} axisLine={{ stroke: '#2A2620' }} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="aligned" radius={[4, 4, 0, 0]}>{voteData.map((e, i) => <Cell key={i} fill={e.aligned > 0 ? '#4A8A56' : e.aligned < 0 ? '#C94040' : '#6B6358'} />)}</Bar></BarChart></ResponsiveContainer>
        </div>
      </div>
      <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)', padding: '20px', marginBottom: '20px' }}>
        <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '16px' }}>TOP CONTRIBUTORS</div>
        {official.topDonors.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-dim)', minWidth: '20px' }}>{i + 1}</div>
            <div style={{ flex: 1 }}><div className="font-mono" style={{ fontSize: '12px', color: 'var(--text)' }}>{d.name}</div><div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{d.industry}</div></div>
            <div className="font-display" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--amber)' }}>${d.amount.toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)', padding: '20px' }}>
        <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '16px' }}>CAMPAIGN PROMISE TRACKING</div>
        {official.promises.map((p, i) => {
          const sc: Record<string, string> = { fulfilled: '#4A8A56', 'in-progress': '#B87D28', broken: '#C94040', 'not-started': '#6B6358' };
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '8px', height: '8px', background: sc[p.status] }} />
              <div style={{ flex: 1 }} className="font-mono" style={{ fontSize: '12px', color: 'var(--text-mid)' }}>{p.text}</div>
              <div className="font-mono" style={{ fontSize: '9px', padding: '2px 8px', border: `1px solid ${sc[p.status]}`, color: sc[p.status], textTransform: 'uppercase' }}>{p.status}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('officials');
  const [selectedOfficial, setSelectedOfficial] = useState<Official | null>(null);
  const [search, setSearch] = useState('');
  const [partyFilter, setPartyFilter] = useState('all');

  const filteredOfficials = useMemo(() => OFFICIALS.filter(o => (o.name.toLowerCase().includes(search.toLowerCase()) || o.state.toLowerCase().includes(search.toLowerCase())) && (partyFilter === 'all' || o.party === partyFilter)), [search, partyFilter]);
  const partyData = useMemo(() => [{ name: 'Democrat', value: OFFICIALS.filter(o => o.party === 'Democrat').length, color: '#2A6096' }, { name: 'Republican', value: OFFICIALS.filter(o => o.party === 'Republican').length, color: '#C94040' }], []);
  const industryData = useMemo(() => { const m = new Map<string, number>(); OFFICIALS.forEach(o => o.topDonors.forEach(d => m.set(d.industry, (m.get(d.industry) || 0) + d.amount))); return Array.from(m.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8); }, []);
  const scoreData = useMemo(() => OFFICIALS.map(o => ({ name: o.name.split(' ').pop() || '', score: o.accountabilityScore, party: o.party })).sort((a, b) => b.score - a.score), []);
  const lobbyingTimeline = useMemo(() => LOBBYING.map((l, i) => ({ name: `L${i + 1}`, amount: l.amount / 1000000, client: l.client, issue: l.issue })), []);

  const tabs: { id: Tab; label: string }[] = [{ id: 'officials', label: 'Officials' }, { id: 'contributions', label: 'Contributions' }, { id: 'lobbying', label: 'Lobbying' }, { id: 'anomalies', label: 'Anomalies' }];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: '52px' }}>
      <Navigation />
      <div style={{ padding: '24px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div><div className="font-display" style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '3px', color: 'var(--text)' }}>Transparency <span style={{ color: 'var(--amber)' }}>Dashboard</span></div><div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>LIVE DATA · NON-PARTISAN · VERIFIABLE</div></div>
          <div className="font-mono" style={{ fontSize: '9px', color: 'var(--green-hi)' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'blink 2s step-end infinite', marginRight: '6px' }} />DATA PIPELINE ACTIVE</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1px', border: '1px solid var(--border)', background: 'var(--border)', marginBottom: '24px' }}>
          {[{ label: 'Officials', value: '537', color: 'var(--text)' }, { label: 'Contributions', value: '$2.8M', color: 'var(--amber-hi)' }, { label: 'Votes', value: '12,847', color: 'var(--text)' }, { label: 'Promises', value: '3,421', color: 'var(--green-hi)' }, { label: 'Lobbyists', value: '1,847', color: 'var(--text)' }, { label: 'Anomalies', value: '23', color: 'var(--red-hi)' }].map(kpi => (
            <div key={kpi.label} style={{ background: 'var(--bg-panel)', padding: '16px 20px' }}><div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{kpi.label}</div><div className="font-display" style={{ fontSize: '36px', fontWeight: 900, color: kpi.color }}>{kpi.value}</div></div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '2px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
          {tabs.map(t => <button key={t.id} onClick={() => { setActiveTab(t.id); setSelectedOfficial(null); }} className="font-mono" style={{ padding: '10px 20px', background: activeTab === t.id ? 'rgba(184,125,40,0.08)' : 'transparent', border: 'none', borderBottom: activeTab === t.id ? '2px solid var(--amber)' : '2px solid transparent', color: activeTab === t.id ? 'var(--amber)' : 'var(--text-dim)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>{t.label}</button>)}
        </div>

        {activeTab === 'officials' && (
          <div>
            {!selectedOfficial ? (
              <>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <input type="text" placeholder="Search officials..." value={search} onChange={e => setSearch(e.target.value)} className="font-mono" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', fontSize: '11px', flex: 1 }} />
                  <select value={partyFilter} onChange={e => setPartyFilter(e.target.value)} className="font-mono" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', fontSize: '11px' }}><option value="all">All Parties</option><option value="Democrat">Democrat</option><option value="Republican">Republican</option></select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {filteredOfficials.map(o => <OfficialCard key={o.id} official={o} onClick={() => setSelectedOfficial(o)} />)}
                </div>
              </>
            ) : <OfficialDetail official={selectedOfficial} onBack={() => setSelectedOfficial(null)} />}
          </div>
        )}

        {activeTab === 'contributions' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)', padding: '20px' }}>
              <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '12px' }}>CONTRIBUTIONS BY INDUSTRY</div>
              <ResponsiveContainer width="100%" height={300}><BarChart data={industryData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#2A2620" /><XAxis type="number" tick={{ fill: '#6B6358', fontSize: 10 }} axisLine={{ stroke: '#2A2620' }} /><YAxis dataKey="name" type="category" tick={{ fill: '#9B9080', fontSize: 10 }} axisLine={{ stroke: '#2A2620' }} width={120} /><Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v.toLocaleString()}`} /><Bar dataKey="value" fill="#B87D28" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>
            </div>
            <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)', padding: '20px' }}>
              <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '12px' }}>PARTY DISTRIBUTION</div>
              <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={partyData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" stroke="#0C0B09" strokeWidth={2}>{partyData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer>
            </div>
            <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)', padding: '20px', gridColumn: '1 / -1' }}>
              <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '12px' }}>ACCOUNTABILITY SCORE BY OFFICIAL</div>
              <ResponsiveContainer width="100%" height={250}><BarChart data={scoreData}><CartesianGrid strokeDasharray="3 3" stroke="#2A2620" /><XAxis dataKey="name" tick={{ fill: '#6B6358', fontSize: 10 }} axisLine={{ stroke: '#2A2620' }} /><YAxis tick={{ fill: '#6B6358', fontSize: 10 }} domain={[0, 100]} axisLine={{ stroke: '#2A2620' }} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="score" radius={[4, 4, 0, 0]}>{scoreData.map((e, i) => <Cell key={i} fill={partyColor(e.party)} />)}</Bar></BarChart></ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'lobbying' && (
          <div>
            <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)', padding: '20px', marginBottom: '20px' }}>
              <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '12px' }}>LOBBYING SPEND TIMELINE ($M)</div>
              <ResponsiveContainer width="100%" height={300}><LineChart data={lobbyingTimeline}><CartesianGrid strokeDasharray="3 3" stroke="#2A2620" /><XAxis dataKey="name" tick={{ fill: '#6B6358', fontSize: 10 }} axisLine={{ stroke: '#2A2620' }} /><YAxis tick={{ fill: '#6B6358', fontSize: 10 }} axisLine={{ stroke: '#2A2620' }} /><Tooltip contentStyle={tooltipStyle} content={({ active, payload }) => { if (!active || !payload?.length) return null; const d = payload[0].payload; return <div style={tooltipStyle}><div style={{ color: '#D8CFC0', fontWeight: 700 }}>{d.client}</div><div style={{ color: '#9B9080' }}>{d.issue}</div><div style={{ color: '#B87D28' }}>${d.amount.toFixed(1)}M</div></div>; }} /><Line type="monotone" dataKey="amount" stroke="#C94040" strokeWidth={2} dot={{ fill: '#C94040', r: 4 }} /></LineChart></ResponsiveContainer>
            </div>
            <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)', overflow: 'hidden' }}>
              <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>RECENT LOBBYING REGISTRATIONS</div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {LOBBYING.map(l => (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)', gap: '16px' }}>
                    <div style={{ flex: 1 }}><div className="font-mono" style={{ fontSize: '12px', color: 'var(--text)' }}>{l.client}</div><div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{l.issue}</div></div>
                    <div className="font-display" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--red-hi)' }}>${(l.amount / 1000000).toFixed(1)}M</div>
                    <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{l.agency}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'anomalies' && (
          <div>
            <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)', padding: '20px', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[{ label: 'Total Flags', value: ANOMALIES.length, color: 'var(--amber)' }, { label: 'High Confidence (>0.8)', value: ANOMALIES.filter(a => a.score > 0.8).length, color: 'var(--red-hi)' }, { label: 'Medium (0.5-0.8)', value: ANOMALIES.filter(a => a.score >= 0.5 && a.score <= 0.8).length, color: 'var(--amber-hi)' }, { label: 'Under Review', value: ANOMALIES.filter(a => a.score < 0.5).length, color: 'var(--green-hi)' }].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '16px', border: '1px solid var(--border)' }}><div className="font-display" style={{ fontSize: '36px', fontWeight: 900, color: s.color }}>{s.value}</div><div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: '8px' }}>{s.label}</div></div>
              ))}
            </div>
            <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.015)' }}><span className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>ANOMALY REGISTRY</span><span className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Sorted by confidence score</span></div>
              {ANOMALIES.sort((a, b) => b.score - a.score).map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)', gap: '16px' }}>
                  <div className="font-display" style={{ fontSize: '28px', fontWeight: 800, minWidth: '56px', textAlign: 'right', color: a.color }}>{a.score.toFixed(2)}</div>
                  <div style={{ flex: 1 }}><div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-mid)' }}>{a.label}</div><div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: '4px' }}>{new Date(a.timestamp).toLocaleDateString()} · {a.method} detection</div></div>
                  <div className="font-mono" style={{ fontSize: '9px', padding: '3px 10px', border: `1px solid ${a.color}`, color: a.color, textTransform: 'uppercase' }}>{a.method}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
