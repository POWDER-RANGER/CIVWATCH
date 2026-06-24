import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { PLATFORM_STATS, ANOMALIES } from '../data/mockData';

function useCountUp(target: number, duration = 1500) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);
  return { ref, val };
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  const { ref, val } = useCountUp(value);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} ref={ref}>
      <div className="font-display" style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1, color, letterSpacing: '-2px' }}>
        {val.toLocaleString()}+
      </div>
      <div className="font-mono" style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [feedIndex, setFeedIndex] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setFeedIndex((p) => (p + 1) % ANOMALIES.length), 5000);
    return () => clearInterval(i);
  }, []);
  const rotated = [...ANOMALIES.slice(feedIndex), ...ANOMALIES.slice(0, feedIndex)];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navigation />
      <section id="hero" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '120px 40px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(184,125,40,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(184,125,40,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--amber), transparent)', animation: 'heroscan 6s linear infinite', opacity: 0.3 }} />
        <div style={{ maxWidth: '900px', position: 'relative', zIndex: 1 }}>
          <div className="font-mono" style={{ fontSize: '10px', letterSpacing: '6px', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '40px', height: '1px', background: 'var(--amber)', display: 'block' }} />
            Ethics Charter v1.0 · Draft for Review
          </div>
          <h1 className="font-display" style={{ fontSize: 'clamp(56px, 9vw, 130px)', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-2px', color: 'var(--text)', marginBottom: '32px' }}>
            THE TRUTH<br /><span style={{ color: 'var(--amber)' }}>HAS NO PARTY.</span>
          </h1>
          <p className="font-mono" style={{ fontSize: '16px', color: 'var(--text-mid)', maxWidth: '600px', lineHeight: 1.8, marginBottom: '24px' }}>
            CIVWATCH tracks campaign contributions, lobbying disclosures, voting records, and campaign promises so that the gap between what officials are paid to do and what they actually vote for is measurable, not anecdotal.
          </p>
          <div className="font-display" style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '2px', color: 'var(--text-dim)', fontStyle: 'italic', marginBottom: '48px' }}>
            "It adjudicates alignment. Not ideology."
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn-primary"><span>↓ Explore the Data</span></Link>
            <button onClick={() => document.getElementById('charter')?.scrollIntoView({ behavior: 'smooth' })} className="btn-ghost">Read the Charter</button>
          </div>
          <div style={{ display: 'flex', gap: '48px', marginTop: '80px', flexWrap: 'wrap' }}>
            <StatCard value={PLATFORM_STATS.officialsTracked} label="Officials Tracked" color="var(--amber-hi)" />
            <StatCard value={Math.round(PLATFORM_STATS.contributionsAnalyzed / 1000)} label="Contributions ($K)" color="var(--green-hi)" />
            <StatCard value={PLATFORM_STATS.votesRecorded} label="Votes Recorded" color="var(--text)" />
            <StatCard value={PLATFORM_STATS.anomaliesFlagged} label="Anomalies Flagged" color="var(--red-hi)" />
          </div>
        </div>
      </section>

      <div className="divider" />

      <section id="mission" style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-eyebrow">§1 — Mission</div>
        <h2 className="section-heading">What We Exist To Do</h2>
        <p className="section-lede">
          CIVWATCH exists to make the financial and procedural machinery of governance legible to the people it governs.
        </p>
        <div style={{ border: '1px solid var(--amber)', padding: '48px', background: 'rgba(184,125,40,0.04)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--amber), transparent)', animation: 'scanline 4s linear infinite' }} />
          <div className="font-display" style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1.2, color: 'var(--text)', marginBottom: '20px' }}>
            CIVWATCH does not adjudicate ideology.
          </div>
          <div className="font-mono" style={{ fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.8, maxWidth: '700px' }}>
            It adjudicates <strong style={{ color: 'var(--amber)' }}>alignment between stated commitments, financial influence, and recorded action.</strong> A politician who votes against their donors' interests and a politician who votes with them are both fully visible.
          </div>
        </div>
      </section>

      <div className="divider" />

      <section id="charter" style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-eyebrow">§2 — Non-Partisan Pledge</div>
        <h2 className="section-heading">No Bias. No Editorial. No Exceptions.</h2>
        <p className="section-lede">
          Methodology for every metric is published and versioned. Changes require a public changelog entry.
        </p>
        <div className="grid-border" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {[
            { icon: '◈', title: 'No Scoring Bias', body: 'CIVWATCH will not score, weight, or display data in a manner that favors any party, ideology, or candidate.' },
            { icon: '◉', title: 'Published Methodology', body: 'Accountability scores, promise-tracking status, and anomaly flags — all methodology is published and versioned.' },
            { icon: '◎', title: 'No Editorial Commentary', body: 'No CIVWATCH-affiliated account publishes editorial commentary on candidates through official channels.' },
            { icon: '◆', title: 'Funding Transparency', body: 'Funding sources disclosed quarterly. Donations above threshold flagged for conflict-of-interest review.' },
          ].map((item) => (
            <div key={item.title} className="grid-cell">
              <div style={{ fontSize: '28px', marginBottom: '12px', display: 'block', color: 'var(--amber)' }}>{item.icon}</div>
              <div className="font-display" style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '10px' }}>{item.title}</div>
              <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-mid)', lineHeight: 1.7 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section id="scope" style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-eyebrow">§3 — Scope</div>
        <h2 className="section-heading">Power, Not People</h2>
        <p className="section-lede">
          CIVWATCH monitors power. The unit of analysis is always an office, a vote, a dollar, or a policy — never a private individual's identity.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', border: '1px solid var(--border)', background: 'var(--border)' }}>
          <div style={{ background: 'var(--bg-panel)', padding: '16px 24px', fontFamily: 'var(--font-disp)', fontSize: '18px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--green-hi)' }}>◆ In Scope</div>
          <div style={{ background: 'var(--bg-panel)', padding: '16px 24px', fontFamily: 'var(--font-disp)', fontSize: '18px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--red-hi)' }}>◇ Out of Scope</div>
          {[
            ['Public officials, candidates, registered lobbyists, PACs, foreign agents (FARA)', 'Private citizens with no political/financial role in the dataset'],
            ['Institutional actors: police departments (policy level), agencies, committees', "Individuals' personal lives, families, or non-public conduct"],
            ['Campaign contributions, lobbying spend, voting records, promise fulfillment', 'Donor PII below aggregation thresholds (k-anonymity ≥ 10)'],
            ['Body camera policy and compliance data at the department level', 'Real-time surveillance feeds, individual officer tracking, or citizen movement'],
          ].map(([inScope, outScope], i) => (
            <div key={i} style={{ display: 'contents' }}>
              <div style={{ background: i % 2 === 0 ? 'var(--bg-panel)' : 'var(--bg-row)', padding: '16px 24px', fontSize: '12px', color: 'var(--text-mid)', lineHeight: 1.7 }}>{inScope}</div>
              <div style={{ background: i % 2 === 0 ? 'var(--bg-panel)' : 'var(--bg-row)', padding: '16px 24px', fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.7 }}>{outScope}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-eyebrow">§4 — Protection</div>
        <h2 className="section-heading">Load-Bearing Commitments</h2>
        <p className="section-lede">These are architectural constraints hard-coded into the platform's design review process.</p>
        <div className="grid-border" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {[
            { title: 'No Profiling', body: 'CIVWATCH will not build, host, or integrate any dataset, model, or feature whose function is to identify, profile, or flag individuals by ethnicity, religion, immigration status, or national origin.' },
            { title: 'Systemic Analysis Only', body: 'Immigration enforcement data is analyzed at the systemic level — detention duration, court backlog, removal rates by jurisdiction. Not individual case data.' },
            { title: 'Hard Ethical Violation', body: "Any feature request that would let CIVWATCH be repurposed as a targeting, surveillance, or watchlist tool is grounds for removing the responsible contributor's access." },
            { title: 'A Check on Power', body: 'The platform exists to make it harder for enforcement actions to be deployed as politically motivated tools against disfavored groups.' },
          ].map((item) => (
            <div key={item.title} className="grid-cell" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: '6px', height: '100%', position: 'absolute', left: 0, top: 0, background: 'var(--red)' }} />
              <div className="font-display" style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '12px', paddingLeft: '12px' }}>{item.title}</div>
              <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-mid)', lineHeight: 1.7, paddingLeft: '12px' }}>{item.body}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section id="data" style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-eyebrow">§5 — Data & Privacy</div>
        <h2 className="section-heading">Privacy by Architecture</h2>
        <p className="section-lede">Every record carries provenance back to its source filing. No third-party analytics. No ad tracking.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {[
            { icon: '◈', label: 'PII Redaction', desc: 'Donor address & employer detail below FEC thresholds redacted or aggregated by ZIP-3 / employer-category.' },
            { icon: '◉', label: 'K-Anonymity', desc: 'Aggregation floor ≥ 10 applies to any cross-tab that could re-identify a small-dollar donor.' },
            { icon: '◎', label: 'Hash-Chained Audit', desc: 'All data modifications use OBELISK audit-chain pattern — every record carries provenance back to source.' },
            { icon: '◆', label: 'No Ad Tracking', desc: 'No third-party analytics or ad tracking on any CIVWATCH-operated surface. Telemetry is first-party, aggregate, and disclosed.' },
            { icon: '◇', label: 'Encrypted', desc: 'Encrypted at rest and in transit. Backups air-gapped and rotated weekly.' },
            { icon: '◊', label: 'Open Standards', desc: 'NIST Privacy Framework. Sunlight Foundation Open Data Guidelines.' },
          ].map((item) => (
            <div key={item.label} style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px', color: 'var(--amber)' }}>{item.icon}</div>
              <div className="font-display" style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '8px' }}>{item.label}</div>
              <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-mid)', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-eyebrow">§6 & §7 — Accountability Infrastructure</div>
        <h2 className="section-heading">Inverting Surveillance</h2>
        <p className="section-lede">
          The body-camera module audits whether departments are complying with their own disclosure policies. Anomaly detection requires multi-agent consensus.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)', padding: '32px' }}>
            <div className="font-display" style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px' }}>Body Camera Accountability</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Policy existence tracking', 'Public-access provision monitoring', 'Disciplinary transparency scoring', '"Camera-off" incident rate analysis', 'Anonymous encrypted tip line'].map((item) => (
                <li key={item} className="font-mono" style={{ fontSize: '12px', color: 'var(--text-mid)', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: 'var(--green-hi)' }}>✓</span> {item}</li>
              ))}
            </ul>
          </div>
          <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)', padding: '32px' }}>
            <div className="font-display" style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px' }}>Algorithmic Integrity</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Multi-agent consensus before flag publication (OBELISK pattern)', 'Every flag carries confidence score + evidence citation', 'Confidence below published floor → human review only', 'False-positive rate tracked publicly (target < 5%)', 'No single model unilaterally flags an official'].map((item) => (
                <li key={item} className="font-mono" style={{ fontSize: '12px', color: 'var(--text-mid)', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: 'var(--green-hi)' }}>✓</span> {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="divider" />

      <section style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-eyebrow">Live Feed</div>
        <h2 className="section-heading">Anomaly Detection</h2>
        <p className="section-lede">
          Real-time pattern detection across contribution networks, voting alignment, and promise fulfillment.
        </p>
        <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.015)' }}>
            <div className="font-mono" style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Anomaly Score Feed</div>
            <div className="font-mono" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', letterSpacing: '2px', color: 'var(--green-hi)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'blink 2s step-end infinite' }} /> SCORING
            </div>
          </div>
          <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '8px 0' }}>
            {rotated.map((a, i) => (
              <div key={a.id + i} style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--border)', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '11px', animation: i === 0 ? 'slidein 0.3s ease-out' : undefined }}>
                <div className="font-display" style={{ fontSize: '22px', fontWeight: 800, minWidth: '44px', textAlign: 'right', color: a.color }}>{a.score.toFixed(2)}</div>
                <div style={{ flex: 1, color: 'var(--text-mid)' }}>{a.label}</div>
                <div style={{ fontSize: '9px', letterSpacing: '2px', padding: '2px 7px', border: `1px solid ${a.color}`, color: a.color, textTransform: 'uppercase' }}>{a.method}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      <section style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-eyebrow">§8 & §9 — Governance</div>
        <h2 className="section-heading">Accountability & Redress</h2>
        <p className="section-lede">Officials named in CIVWATCH data have a published right-of-reply channel. This charter is reviewed quarterly.</p>
        <div style={{ border: '1px solid var(--amber)', padding: '48px', background: 'rgba(184,125,40,0.04)', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--amber), transparent)', animation: 'scanline 4s linear infinite' }} />
          <div className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1.1, color: 'var(--text)', marginBottom: '20px' }}>
            Watch Everything.<br />Trust the Data.<br /><span style={{ color: 'var(--amber)' }}>Fear Nothing.</span>
          </div>
          <p className="font-mono" style={{ fontSize: '14px', color: 'var(--text-mid)', maxWidth: '560px', margin: '0 auto 40px', lineHeight: 1.8 }}>
            CIVWATCH is open source, non-partisan, and structurally complete. Explore the data. Read the methodology. Verify everything.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn-primary"><span>↗ Launch Dashboard</span></Link>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btn-ghost">Back to Top</button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
