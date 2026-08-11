# Alert Runbooks

Every alert is symptom-based: it describes an impact visible to users or an SLO breach, rather than an internal function or component name.

## Alert 1

- Name: High chat latency P95
- Severity: warning
- Related SLI/SLO: `latency_p95_ms`, objective <= 3000 ms for 99.5% of requests.
- Condition and duration: P95 latency exceeds 3000 ms for 5 minutes.
- User impact: users experience slow responses or may abandon a chat request.
- First three checks:
  1. Check P50/P95/P99 on the dashboard and identify the affected feature or time window.
  2. Open the slowest Langfuse trace and identify the longest span (`retrieve`, `generate`, or prompt retrieval).
  3. Use the trace correlation ID to find matching records in `data/logs.jsonl` and compare request metadata.
- Temporary mitigation: reduce concurrency, disable an affected feature, or roll back the production prompt/recent release.
- Owner: on-call-engineer

## Alert 2

- Name: Elevated chat error rate
- Severity: critical
- Related SLI/SLO: `error_rate_pct`, objective <= 2%.
- Condition and duration: error rate exceeds 5% for 3 minutes.
- User impact: users do not receive a usable answer.
- First three checks:
  1. Check `error_rate_pct` and `error_breakdown` on `/metrics` or the dashboard.
  2. Open a recent failed trace and identify the failed span or error message.
  3. Find `request_failed` with the same correlation ID in `data/logs.jsonl`.
- Temporary mitigation: disable the failing feature or incident scenario and roll back the latest application or prompt change.
- Owner: on-call-engineer

## Alert 3

- Name: Daily AI cost budget exceeded
- Severity: warning
- Related SLI/SLO: `daily_cost_usd`, objective <= 2.5 USD.
- Condition and duration: daily cost exceeds 2.5 USD.
- User impact: no immediate request failure, but continued use risks exhausting the service budget.
- First three checks:
  1. Check total cost, average cost, and input/output token totals.
  2. Open high-cost traces and compare model, feature, and prompt version metadata.
  3. Use correlation IDs to identify the request pattern responsible for the cost increase.
- Temporary mitigation: roll back the prompt or model change, reduce output-token limits, and temporarily disable the expensive feature.
- Owner: team-lead
