"use client";

import { useMemo, useState } from "react";

const snapshot = {
  requests: 96,
  p50: 150,
  p95: 2654,
  p99: 3018,
  errorRate: 0,
  costTotal: 0.1987,
  costAverage: 0.0021,
  tokensIn: 3500,
  tokensOut: 12546,
  quality: 0.88,
};

const trafficBars = [38, 54, 46, 61, 49, 72, 58, 66, 82, 63, 74, 68];

function PanelHeader({ eyebrow, title, status }: { eyebrow: string; title: string; status: string }) {
  return (
    <div className="panel-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <span className="panel-status">{status}</span>
    </div>
  );
}

export default function Home() {
  const [range, setRange] = useState("Last 60 minutes");
  const [refreshedAt, setRefreshedAt] = useState("17:40:12");
  const totalTokens = snapshot.tokensIn + snapshot.tokensOut;
  const tokenInShare = Math.round((snapshot.tokensIn / totalTokens) * 100);
  const refreshedLabel = useMemo(() => `Updated ${refreshedAt} ICT`, [refreshedAt]);

  function refreshSnapshot() {
    setRefreshedAt(new Date().toLocaleTimeString("en-GB", { hour12: false }));
  }

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">O</span>
          <div>
            <p>DAY 13 LAB</p>
            <strong>AI Observability</strong>
          </div>
        </div>
        <div className="header-actions">
          <span className="source-pill"><i /> Live snapshot · data/logs.jsonl</span>
          <select aria-label="Dashboard time range" value={range} onChange={(event) => setRange(event.target.value)}>
            <option>Last 30 minutes</option>
            <option>Last 60 minutes</option>
            <option>Last 24 hours</option>
          </select>
          <button type="button" onClick={refreshSnapshot}>↻ Refresh</button>
        </div>
      </header>

      <section className="page-intro">
        <div>
          <p className="breadcrumb">OPERATIONS / PRODUCTION / OVERVIEW</p>
          <h1>System health at a glance</h1>
          <p>Metrics, traces, and logs correlated across the AI request lifecycle.</p>
        </div>
        <div className="overall-status">
          <span className="status-light" />
          <div><strong>System observable</strong><small>{refreshedLabel}</small></div>
        </div>
      </section>

      <section className="incident-strip">
        <span className="incident-icon">!</span>
        <div><strong>Latency investigation captured</strong><p>rag_slow · retrieve 2.50s · correlation req-d5a50490</p></div>
        <span className="incident-result">ROOT CAUSE VERIFIED</span>
      </section>

      <section className="metric-grid" aria-label="Six observability panels">
        <article className="panel latency-panel">
          <PanelHeader eyebrow="01 / LATENCY" title="Request latency" status="SLO < 3,000 ms" />
          <div className="hero-metric"><strong>{(snapshot.p95 / 1000).toFixed(2)}s</strong><span>P95 · within SLO</span></div>
          <div className="latency-chart" aria-label="Latency percentile comparison">
            {[
              ["P50", snapshot.p50],
              ["P95", snapshot.p95],
              ["P99", snapshot.p99],
            ].map(([label, value]) => (
              <div className="latency-row" key={label}>
                <span>{label}</span><div className="track"><i style={{ width: `${Math.min(100, Number(value) / 36)}%` }} /></div><b>{Number(value).toLocaleString()} ms</b>
              </div>
            ))}
          </div>
          <div className="slo-note"><i /> P99 crossed the 3,000 ms investigation line by 18 ms</div>
        </article>

        <article className="panel traffic-panel">
          <PanelHeader eyebrow="02 / TRAFFIC" title="Request volume" status={range} />
          <div className="hero-metric"><strong>{snapshot.requests}</strong><span>completed requests</span></div>
          <div className="mini-bars" aria-label="Traffic trend">
            {trafficBars.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
          </div>
          <div className="split-footer"><span>Avg throughput</span><b>1.6 req/min</b></div>
        </article>

        <article className="panel error-panel">
          <PanelHeader eyebrow="03 / ERRORS" title="Error rate" status="Objective < 2%" />
          <div className="error-layout">
            <div className="ring"><div><strong>{snapshot.errorRate}%</strong><span>healthy</span></div></div>
            <div className="breakdown"><p><span>Timeout</span><b>0</b></p><p><span>Tool failure</span><b>0</b></p><p><span>Other</span><b>0</b></p></div>
          </div>
          <div className="success-callout">✓ 96 / 96 requests completed successfully</div>
        </article>

        <article className="panel cost-panel">
          <PanelHeader eyebrow="04 / COST" title="AI spend" status="Budget $2.50 / day" />
          <div className="hero-metric"><strong>${snapshot.costTotal.toFixed(4)}</strong><span>total observed cost</span></div>
          <div className="budget-track"><i style={{ width: `${(snapshot.costTotal / 2.5) * 100}%` }} /></div>
          <div className="budget-scale"><span>$0</span><span>7.9% used</span><span>$2.50</span></div>
          <div className="split-footer"><span>Average per request</span><b>${snapshot.costAverage.toFixed(4)}</b></div>
        </article>

        <article className="panel tokens-panel">
          <PanelHeader eyebrow="05 / TOKENS" title="Token consumption" status="Limit 50k" />
          <div className="hero-metric"><strong>{totalTokens.toLocaleString()}</strong><span>total tokens</span></div>
          <div className="token-track"><i style={{ width: `${tokenInShare}%` }} /><b /></div>
          <div className="token-legend">
            <p><i className="in" /><span>Input</span><b>{snapshot.tokensIn.toLocaleString()}</b></p>
            <p><i className="out" /><span>Output</span><b>{snapshot.tokensOut.toLocaleString()}</b></p>
          </div>
        </article>

        <article className="panel quality-panel">
          <PanelHeader eyebrow="06 / QUALITY" title="Response quality" status="Objective ≥ 0.75" />
          <div className="quality-layout">
            <div className="quality-score"><strong>{snapshot.quality.toFixed(2)}</strong><span>/ 1.00</span></div>
            <div className="quality-copy"><b>Above target</b><p>+0.13 above the service objective</p></div>
          </div>
          <div className="quality-scale"><i style={{ width: `${snapshot.quality * 100}%` }} /><span style={{ left: "75%" }}>SLO</span></div>
          <div className="split-footer"><span>Evaluated responses</span><b>{snapshot.requests}</b></div>
        </article>
      </section>

      <footer><span>Day13 · K4 Observability Lab</span><span>Source snapshot: 204 structured log records</span></footer>
    </main>
  );
}
