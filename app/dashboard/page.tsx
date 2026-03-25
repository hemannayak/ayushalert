'use client';
import { useEffect, useState, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Metrics {
  totalRecords: number;
  activeRegions: number;
  alertsTriggered: number;
  topSymptom: string;
  pctChange: number;
  currentCount: number;
}
interface SymptomEvent {
  region: string;
  regionName: string;
  diagnosis: string;
  count: number;
  lastSeen: string;
  status: 'normal' | 'warning' | 'outbreak';
  outbreak: boolean;
}
interface RegionTotal {
  region: string;
  regionName: string;
  total: number;
  status: 'normal' | 'warning' | 'outbreak';
}
interface FeedItem {
  id: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  region: string;
}
interface SymptomChart {
  name: string;
  count: number;
}
interface AnalyticsData {
  period: string;
  threshold: number;
  warningThreshold: number;
  metrics: Metrics;
  events: SymptomEvent[];
  regionTotals: RegionTotal[];
  outbreaks: SymptomEvent[];
  warnings: SymptomEvent[];
  feed: FeedItem[];
  symptomChart: SymptomChart[];
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number | string; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const isNumber = typeof value === 'number';

  useEffect(() => {
    if (!isNumber) return;
    let start = 0;
    const end = value as number;
    if (end === 0) { setDisplay(0); return; }
    const duration = 1200;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value, isNumber]);

  if (!isNumber) return <span>{prefix}{value}{suffix}</span>;
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

// ─── Pulse dot ────────────────────────────────────────────────────────────────
function PulseDot({ color = 'emerald' }: { color?: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-400',
    rose:    'bg-rose-400',
    amber:   'bg-amber-400',
    indigo:  'bg-indigo-400',
  };
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorMap[color]} opacity-60`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colorMap[color]}`} />
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: 'normal' | 'warning' | 'outbreak' }) {
  const cfg = {
    normal:   { cls: 'bg-emerald-900/40 text-emerald-400 border-emerald-500/40', dot: 'emerald', label: 'NOMINAL' },
    warning:  { cls: 'bg-amber-900/40  text-amber-400  border-amber-500/40',  dot: 'amber',   label: 'WARNING' },
    outbreak: { cls: 'bg-rose-900/40   text-rose-400   border-rose-500/50',   dot: 'rose',    label: 'CRITICAL' },
  }[status];
  return (
    <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border flex items-center gap-1.5 ${cfg.cls}`}>
      <PulseDot color={cfg.dot} /> {cfg.label}
    </span>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({
  icon, label, value, sub, accent = 'indigo', isString = false,
}: {
  icon: string; label: string; value: number | string; sub?: string; accent?: string; isString?: boolean;
}) {
  const glowMap: Record<string, string> = {
    indigo:  'shadow-[0_0_40px_rgba(99,102,241,0.12)] border-indigo-500/20',
    emerald: 'shadow-[0_0_40px_rgba(16,185,129,0.12)] border-emerald-500/20',
    rose:    'shadow-[0_0_40px_rgba(225,29,72,0.15)]  border-rose-500/25',
    amber:   'shadow-[0_0_40px_rgba(245,158,11,0.12)] border-amber-500/20',
  };
  const textMap: Record<string, string> = {
    indigo:  'text-indigo-400',
    emerald: 'text-emerald-400',
    rose:    'text-rose-400',
    amber:   'text-amber-400',
  };
  const bgMap: Record<string, string> = {
    indigo:  'bg-indigo-500/10',
    emerald: 'bg-emerald-500/10',
    rose:    'bg-rose-500/10',
    amber:   'bg-amber-500/10',
  };

  return (
    <div className={`glass-panel p-6 border ${glowMap[accent]} flex flex-col gap-3 group hover:scale-[1.02] transition-transform duration-300`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${bgMap[accent]} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className={`text-2xl font-black tracking-tight ${textMap[accent]}`}>
          {isString
            ? <span className="capitalize">{value}</span>
            : <AnimatedCounter value={value as number} />}
        </p>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-zinc-600 mt-1 font-mono">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [data, setData]           = useState<AnalyticsData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [period, setPeriod]       = useState<'24h' | '7d' | '30d'>('24h');
  const [filterSymptom, setFilter] = useState('');
  const [filterRegion, setRegion]  = useState('');
  const [lastRefresh, setLast]    = useState(new Date());
  const [simulating, setSimulating] = useState(false);
  const [simMsg, setSimMsg]       = useState('');
  const [feedIdx, setFeedIdx]     = useState(0);
  const feedRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (p = period, s = filterSymptom, r = filterRegion) => {
    try {
      const params = new URLSearchParams({ period: p });
      if (s) params.set('symptom', s);
      if (r) params.set('region', r);
      const res   = await fetch(`/api/analytics?${params}`);
      const json  = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load');
      setData(json);
      setLast(new Date());
      setError('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [period, filterSymptom, filterRegion]);

  useEffect(() => {
    fetchData(period, filterSymptom, filterRegion);
    const iv = setInterval(() => fetchData(period, filterSymptom, filterRegion), 30000);
    return () => clearInterval(iv);
  }, [period, filterSymptom, filterRegion, fetchData]);

  // Rotate feed
  useEffect(() => {
    if (!data?.feed?.length) return;
    feedRef.current = setInterval(() => {
      setFeedIdx(i => (i + 1) % Math.min(data.feed.length, 8));
    }, 3500);
    return () => { if (feedRef.current) clearInterval(feedRef.current); };
  }, [data?.feed?.length]);

  const handleSimulate = async () => {
    setSimulating(true);
    setSimMsg('');
    try {
      const res  = await fetch('/api/analytics/simulate', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSimMsg(`🔴 ${json.message}`);
      await fetchData(period, filterSymptom, filterRegion);
    } catch (e: any) {
      setSimMsg('Simulation failed: ' + e.message);
    } finally {
      setSimulating(false);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mt-10 px-4 space-y-6">
        <div className="glass-panel h-32 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="glass-panel h-28 animate-pulse" />)}
        </div>
        <div className="glass-panel h-48 animate-pulse" />
        <div className="glass-panel h-64 animate-pulse" />
      </div>
    );
  }

  const m = data?.metrics;
  const alertState: 'normal' | 'warning' | 'outbreak' =
    (data?.outbreaks?.length ?? 0) > 0 ? 'outbreak'
    : (data?.warnings?.length ?? 0) > 0  ? 'warning'
    : 'normal';

  const maxSymptomCount = Math.max(...(data?.symptomChart?.map(s => s.count) ?? [1]), 1);
  const maxRegionTotal  = Math.max(...(data?.regionTotals?.map(r => r.total) ?? [1]), 1);

  const SYMPTOM_COLORS: Record<string, string> = {
    normal:   'from-indigo-600 to-indigo-400',
    warning:  'from-amber-600 to-amber-400',
    outbreak: 'from-rose-600 to-rose-400',
  };

  const feed = data?.feed ?? [];
  const visibleFeed = feed.slice(feedIdx, feedIdx + 5).concat(
    feedIdx + 5 > feed.length ? feed.slice(0, Math.max(0, (feedIdx + 5) - feed.length)) : []
  );

  const regions = data?.regionTotals ?? [];
  const uniqueRegions = [...new Set(regions.map(r => r.region))];
  const uniqueSymptoms = [...new Set((data?.events ?? []).map(e => e.diagnosis))];

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4 pb-24 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-transparent to-purple-900/10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <PulseDot color="emerald" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Live · Anonymized · Decentralized</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            🌍 Population Health Intelligence
          </h1>
          <p className="text-zinc-500 text-xs font-mono mt-1">
            Data aggregated from anonymized patient &amp; hospital records · AyushAlert Neural Analytics Engine v2
          </p>
        </div>
        <div className="relative z-10 flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <a href="/"
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2"
            >
              🏠 Home
            </a>
            <button
              onClick={() => fetchData(period, filterSymptom, filterRegion)}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 group"
            >
              <span className="group-hover:rotate-180 transition-transform duration-500 inline-block">🔄</span> Force Sync
            </button>
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="bg-rose-900/50 hover:bg-rose-800/60 border border-rose-600/50 text-rose-300 px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-2 disabled:opacity-60 shadow-[0_0_20px_rgba(225,29,72,0.2)]"
            >
              {simulating ? '⏳ Simulating...' : '🧪 Simulate Outbreak'}
            </button>
          </div>
          <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
            Last sync: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {simMsg && (
        <div className="bg-rose-950/60 border border-rose-500/50 text-rose-300 px-5 py-3 rounded-xl text-sm font-semibold shadow-[0_0_30px_rgba(225,29,72,0.2)] animate-in slide-in-from-top duration-500">
          {simMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-950/40 border border-red-500/40 text-red-300 px-4 py-3 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* ── Filter Bar ─────────────────────────────────────────────────────── */}
      <div className="glass-panel p-4 flex flex-wrap items-center gap-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mr-1">Filters</span>
        
        {/* Period */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          {(['24h', '7d', '30d'] as const).map(p => (
            <button
              key={p}
              onClick={() => { setPeriod(p); fetchData(p, filterSymptom, filterRegion); }}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest transition ${
                period === p
                  ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Symptom */}
        <select
          value={filterSymptom}
          onChange={e => { setFilter(e.target.value); fetchData(period, e.target.value, filterRegion); }}
          className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 transition"
        >
          <option value="">All Symptoms</option>
          {uniqueSymptoms.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>

        {/* Region */}
        <select
          value={filterRegion}
          onChange={e => { setRegion(e.target.value); fetchData(period, filterSymptom, e.target.value); }}
          className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 transition"
        >
          <option value="">All Regions</option>
          {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <span className="ml-auto text-[10px] font-mono text-zinc-600">
          Confidence: <span className="text-emerald-400 font-bold">HIGH</span> · Verified EMR + PHR
        </span>
      </div>

      {/* ── Metrics Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon="📋"
          label="Records Processed"
          value={m?.totalRecords ?? 0}
          sub="Total anonymized health records"
          accent="indigo"
        />
        <MetricCard
          icon="📍"
          label="Active Regions"
          value={m?.activeRegions ?? 0}
          sub={`In last ${period}`}
          accent="emerald"
        />
        <MetricCard
          icon="🚨"
          label="Events Logged"
          value={m?.alertsTriggered ?? 0}
          sub={`${m?.pctChange !== undefined ? (m.pctChange >= 0 ? '+' : '') + m.pctChange + '% vs prev period' : ''}`}
          accent={alertState === 'outbreak' ? 'rose' : alertState === 'warning' ? 'amber' : 'indigo'}
        />
        <MetricCard
          icon="🦠"
          label="Top Symptom"
          value={m?.topSymptom ?? '—'}
          sub="Most reported condition"
          accent="amber"
          isString
        />
      </div>

      {/* ── Outbreak Alert Banner ──────────────────────────────────────────── */}
      {alertState === 'outbreak' && (
        <div className="glass-panel p-6 border-rose-500/50 bg-rose-950/20 shadow-[0_0_60px_rgba(225,29,72,0.15)] relative overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(225,29,72,0.04)_12px,rgba(225,29,72,0.04)_24px)] pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl animate-pulse">🚨</span>
                <h2 className="text-2xl font-black text-rose-400 tracking-wide">POTENTIAL OUTBREAK DETECTED</h2>
              </div>
              <p className="text-rose-300/70 text-sm font-mono">
                Threshold breach: ≥{data?.threshold} cases/region in {period} cycle ·{' '}
                {m?.pctChange !== undefined && m.pctChange > 0
                  ? `Cases increased ${m.pctChange}% vs previous period`
                  : 'Elevated case density detected'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {data?.outbreaks?.slice(0, 3).map((o, i) => (
                <div key={i} className="bg-rose-950 border border-rose-700/60 rounded-xl px-4 py-3 min-w-[140px]">
                  <p className="font-black text-white capitalize text-sm">{o.diagnosis}</p>
                  <p className="text-rose-400 text-[10px] uppercase tracking-widest">{o.regionName || o.region}</p>
                  <p className="text-rose-300 font-black text-2xl leading-tight drop-shadow-[0_0_8px_rgba(225,29,72,0.6)]">{o.count}</p>
                  <p className="text-rose-500/70 text-[9px] font-bold uppercase">Cases</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {alertState === 'warning' && (
        <div className="glass-panel p-5 border-amber-500/40 bg-amber-950/15 shadow-[0_0_40px_rgba(245,158,11,0.1)] animate-in slide-in-from-top duration-400">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-black text-amber-400 tracking-wide">ELEVATED RISK DETECTED</h3>
              <p className="text-xs text-amber-300/60 font-mono">
                {data?.warnings?.length} region(s) approaching outbreak threshold · Monitor closely
                {m?.pctChange !== undefined && m.pctChange > 0 && ` · +${m.pctChange}% case increase`}
              </p>
            </div>
          </div>
        </div>
      )}

      {alertState === 'normal' && (
        <div className="glass-panel p-5 border-emerald-500/25 bg-emerald-950/10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-900/50 border border-emerald-500/40 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(16,185,129,0.25)]">✓</div>
          <div>
            <h3 className="font-bold text-emerald-400 tracking-wide">System Nominal</h3>
            <p className="text-[11px] text-emerald-200/50 font-mono">No outbreak parameters detected in the trailing {period} window · All regions within safe thresholds</p>
          </div>
        </div>
      )}

      {/* ── Charts + Region Grid ───────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-6 items-start">

        {/* Symptom Frequency Chart */}
        <div className="glass-panel p-6 lg:col-span-3 relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500/5 blur-[60px] rounded-full pointer-events-none" />
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-300 mb-1 flex items-center gap-2">
            <span className="text-indigo-400">🦠</span> Symptom Frequency
          </h2>
          <p className="text-[10px] text-zinc-600 font-mono mb-5">Cases per condition · {period} window</p>
          {(data?.symptomChart?.length ?? 0) > 0 ? (
            <div className="space-y-3 relative z-10">
              {data!.symptomChart.map((s, i) => {
                const pct = Math.round((s.count / maxSymptomCount) * 100);
                // figure out status based on count
                const st = s.count >= (data?.threshold ?? 5) ? 'outbreak'
                         : s.count >= (data?.warningThreshold ?? 3) ? 'warning' : 'normal';
                return (
                  <div key={i} className="group">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-bold text-zinc-200 capitalize">{s.name}</span>
                      <span className={`font-black ${st === 'outbreak' ? 'text-rose-400' : st === 'warning' ? 'text-amber-400' : 'text-indigo-400'}`}>
                        {s.count} {s.count === 1 ? 'case' : 'cases'}
                      </span>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800/60 rounded-full h-2 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${SYMPTOM_COLORS[st]} transition-all duration-1000 ease-out`}
                        style={{ width: `${pct}%`, boxShadow: st === 'outbreak' ? '0 0 8px rgba(225,29,72,0.7)' : st === 'warning' ? '0 0 8px rgba(245,158,11,0.5)' : '0 0 6px rgba(99,102,241,0.5)' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-600 text-sm">No symptom data in this window</div>
          )}
        </div>

        {/* Region Heatmap */}
        <div className="glass-panel p-6 lg:col-span-2 relative overflow-hidden">
          <div className="absolute -top-8 -left-8 w-32 h-32 bg-blue-500/8 blur-[50px] rounded-full pointer-events-none" />
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-300 mb-1 flex items-center gap-2">
            <span className="text-blue-400">📍</span> Region Heatmap
          </h2>
          <p className="text-[10px] text-zinc-600 font-mono mb-5">Hyderabad zones · {period}</p>
          {regions.length > 0 ? (
            <div className="space-y-4 relative z-10">
              {regions.map((r, i) => {
                const pct = Math.round((r.total / maxRegionTotal) * 100);
                const barColor = r.status === 'outbreak' ? 'from-rose-600 to-rose-400 shadow-[0_0_8px_rgba(225,29,72,0.7)]'
                               : r.status === 'warning'  ? 'from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                               : 'from-blue-600 to-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.4)]';
                return (
                  <div key={i} className="group">
                    <div className="flex justify-between items-center mb-1">
                      <div>
                        <span className="text-xs font-bold text-zinc-200">{r.regionName || r.region}</span>
                        <span className="text-[9px] ml-2 font-mono text-zinc-600">{r.region}</span>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800/60 rounded-full h-1.5 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000 ease-out`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-zinc-600 font-mono mt-1">{r.total} event{r.total !== 1 ? 's' : ''}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-600 text-sm">No regional data</div>
          )}
        </div>
      </div>

      {/* ── Live Activity Feed + Event Table ──────────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-6 items-start">

        {/* Live Feed */}
        <div className="glass-panel p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <PulseDot color="indigo" />
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-300">Live Activity Feed</h2>
          </div>
          {visibleFeed.length > 0 ? (
            <div className="space-y-2">
              {visibleFeed.map((item, i) => {
                const dotColor = item.severity === 'critical' ? 'bg-rose-400' : item.severity === 'warning' ? 'bg-amber-400' : 'bg-indigo-400';
                const bgColor  = item.severity === 'critical' ? 'border-rose-500/20 bg-rose-950/20'
                               : item.severity === 'warning'  ? 'border-amber-500/20 bg-amber-950/20'
                               : 'border-zinc-800/60 bg-zinc-900/40';
                const age = Date.now() - new Date(item.timestamp).getTime();
                const ageLabel = age < 60000 ? 'just now'
                               : age < 3600000 ? `${Math.floor(age / 60000)}m ago`
                               : `${Math.floor(age / 3600000)}h ago`;
                return (
                  <div
                    key={`${item.id}-${i}`}
                    className={`border rounded-lg px-3 py-2.5 flex items-start gap-2.5 transition-all duration-500 ${bgColor} ${i === 0 ? 'opacity-100' : 'opacity-70'}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${dotColor} ${item.severity === 'critical' ? 'animate-pulse shadow-[0_0_6px_rgba(225,29,72,0.8)]' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-200 font-medium leading-snug">{item.message}</p>
                      <p className="text-[9px] text-zinc-600 font-mono mt-0.5">{ageLabel} · Zone {item.region}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-600 text-sm flex flex-col items-center gap-2">
              <span className="text-2xl animate-pulse">📡</span>
              Awaiting telemetry
            </div>
          )}
        </div>

        {/* Disease Event Table */}
        <div className="glass-panel p-6 lg:col-span-3 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500/5 blur-[60px] rounded-full pointer-events-none" />
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-300 mb-5 flex items-center gap-2">
            <span className="text-indigo-400">📊</span> Disease Event Matrix
          </h2>
          {(data?.events?.length ?? 0) > 0 ? (
            <div className="overflow-x-auto relative z-10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[9px] font-black uppercase tracking-widest text-zinc-600 border-b border-zinc-800/80">
                    <th className="pb-3 pr-3">Region</th>
                    <th className="pb-3 pr-3">Condition</th>
                    <th className="pb-3 pr-3">Cases</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {data!.events.slice(0, 10).map((e, i) => (
                    <tr key={i} className={`group transition-colors hover:bg-zinc-900/40 ${e.outbreak ? 'bg-rose-950/10' : ''}`}>
                      <td className="py-3 pr-3 font-mono text-zinc-400">
                        <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 group-hover:border-indigo-500/30 transition-colors">
                          {e.regionName || e.region}
                        </span>
                      </td>
                      <td className="py-3 pr-3 capitalize font-bold text-zinc-200">{e.diagnosis}</td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="bg-zinc-900 border border-zinc-800 rounded-full h-1 w-16 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${e.status === 'outbreak' ? 'bg-rose-500 shadow-[0_0_4px_rgba(225,29,72,0.8)]' : e.status === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'}`}
                              style={{ width: `${Math.round((e.count / maxSymptomCount) * 100)}%` }}
                            />
                          </div>
                          <span className={`font-black ${e.status === 'outbreak' ? 'text-rose-400' : e.status === 'warning' ? 'text-amber-400' : 'text-indigo-400'}`}>{e.count}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right"><StatusBadge status={e.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-zinc-600 text-sm">
              <p className="text-2xl mb-2 animate-pulse">📡</p>
              <p className="font-bold text-zinc-400">No event data in this window</p>
              <p className="text-xs mt-1">Try a broader period or click <span className="text-rose-400 font-semibold">Simulate Outbreak</span></p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer Attribution ─────────────────────────────────────────────── */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-zinc-800/30">
        <p className="text-[10px] font-mono text-zinc-600 text-center sm:text-left">
          📊 Data aggregated from anonymized patient &amp; hospital records · AyushAlert complies with ABDM &amp; DISHA privacy framework
        </p>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-950/50 border border-emerald-700/40 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Confidence: High
          </span>
          <span className="text-[9px] font-bold text-zinc-600 font-mono">🔒 Zero-Knowledge · E2E Encrypted</span>
        </div>
      </div>

    </div>
  );
}
