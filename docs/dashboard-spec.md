# Dashboard specification

The runtime source is `data/logs.jsonl`, following the six-panel contract in `config/dashboard.yaml`. The dashboard defaults to the last 60 minutes, refreshes every 30 seconds where supported, and displays a threshold/SLO line on every applicable panel.

The runnable implementation is in `dashboard/`. Start it with `cd dashboard && npm install && npm run dev`, then open `http://localhost:3000`. The current evidence snapshot contains 96 completed requests aggregated from 204 structured log records and includes the investigated `rag_slow` correlation ID.

| Panel | Source fields | Visualization and unit | Threshold / SLO line |
|---|---|---|---|
| Latency percentiles | `response_sent.latency_ms` | Line chart: P50, P95, P99 in ms | P95 <= 3000 ms |
| Request traffic | `request_received` events | Requests per minute | At least 1 request/minute during an active test |
| Error rate and breakdown | `request_failed.error_type`, `request_received` | Percent plus error-type breakdown table | Error rate <= 2% |
| Cost over time | `response_sent.cost_usd` | USD per minute and total USD | Daily cost <= 2.5 USD |
| Input and output tokens | `response_sent.tokens_in`, `response_sent.tokens_out` | Token totals | Review when total exceeds 50,000 tokens |
| Quality proxy | `response_sent.quality_score` | Average score from 0 to 1 | Average >= 0.75 |

The dashboard is paired with Langfuse traces for drill-down. When a threshold is breached, open the relevant trace, read its correlation ID, then search `data/logs.jsonl` for the matching request.

Before taking dashboard evidence, run:

```bash
python scripts/validate_dashboard.py
```

Save the full dashboard view as `submission/evidence/dashboard-six-panels.png` so all six panels and their thresholds are visible in one image.
