# Day 13 AI Observability Dashboard

Local six-panel dashboard for the Lab 13 evidence package. The displayed snapshot is derived from `../data/logs.jsonl` and covers latency, traffic, errors, cost, tokens, and quality.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and save a full-page screenshot as `../submission/evidence/dashboard-six-panels.png`.

## Verify

```bash
npm run build
npm test
python ../scripts/validate_dashboard.py
```

The dashboard highlights the investigated `rag_slow` incident and its correlation ID so the visual can be connected to the trace and log evidence.
