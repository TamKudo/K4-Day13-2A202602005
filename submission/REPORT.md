# Báo cáo Day 13 Observability

## 1. Thông tin nhóm

- Tên nhóm: Nhóm Alpha
- Repository URL: https://github.com/TamKudo/K4-Day13-2A202602005
- Commit code và evidence: `4f57949c61012ad460a4d52d37f43b08c7ad338a`
- Commit báo cáo trước lần rà soát cuối: `fb4f6119ff7cf55cfcfca06139809a655f4b8a4c`
- Thành viên và vai trò:
  - Phạm Hải Yến — 2A202601152: Metrics & Alerting
  - Trần Hoàng Khôi — 2A202601778: Security & Compliance
  - Trần Văn Toàn — 2A202601218: QA & Incident Analyst
  - Trương Minh Tâm — 2A202602005: Logging & Middleware

## 2. Kết quả kỹ thuật

- Điểm `validate_logs.py`:
  - Baseline trước CP1: 30/100 — 21 records, thiếu correlation ID và enrichment.
  - Sau CP1: 100/100 — không thiếu required fields/enrichment, không phát hiện PII leak.
  - Evidence: [validate-logs-final.png](evidence/validate-logs-final.png)
- Tổng số traces: tối thiểu 10; evidence Langfuse hiển thị danh sách nhiều traces và metadata prompt.
- Số PII leak còn lại: 0 theo `validate_logs.py`.
- Dashboard local: chạy từ thư mục `dashboard/` tại `http://localhost:3000`.

## 3. Logging và tracing

- Evidence correlation ID:
  - Challenge request dùng `req-d5a50490`.
  - Request có PII redaction dùng `req-c83c2651`.
  - Evidence: [challenge-log-req-d5a50490.png](evidence/challenge-log-req-d5a50490.png), [log-correlation-pii-redaction.png](evidence/log-correlation-pii-redaction.png).
- Evidence PII redaction: payload chứa email được chuyển thành `[REDACTED_EMAIL]`; raw `user_id` không được log, chỉ có `user_id_hash`.
- Evidence trace waterfall:
  - Baseline: [trace-baseline.png](evidence/trace-baseline.png)
  - Candidate: [trace-candidate.png](evidence/trace-candidate.png)
  - Challenge waterfall: [challenge-trace-retrieve-slow.png](evidence/challenge-trace-retrieve-slow.png)
- Span đáng chú ý: trace challenge có tổng latency 3.60s; `retrieve` chiếm 2.50s trong khi `generate` chỉ 0.15s. Vì vậy retrieval là vị trí cần điều tra, không phải LLM generation.

## 4. Prompt versioning

- Prompt name: `day13-chat`.
- Version 1: label `baseline`, sau đó được gán `production` khi rollback.
- Version 2: label `candidate`, sau đó từng được gán `production` để kiểm chứng chuyển label.
- Trace baseline: `3d4d25067a0f0f3522529e7f1258e856` — [trace-baseline.png](evidence/trace-baseline.png).
- Trace candidate: `9a0fc3b1e22ae6fa894b394d8661ace3` — [trace-candidate.png](evidence/trace-candidate.png).
- Evidence hai version/label: [prompt-versions-list.png](evidence/prompt-versions-list.png), [production-on-v2.png](evidence/production-on-v2.png).
- Evidence rollback về version 1/production: [production-rollback-v1.png](evidence/production-rollback-v1.png), [production-rollback-evidence.png](evidence/production-rollback-evidence.png).

## 5. Dashboard, SLO và alerts

- Kết quả `validate_dashboard.py`: hợp lệ 6/6 panel — [validate-dashboard-final.png](evidence/validate-dashboard-final.png).
- Evidence dashboard: [dashboard-six-panels.png](evidence/dashboard-six-panels.png). Sáu nhóm là latency, traffic, error rate, cost, tokens và quality.
- SLO đã chọn:
  - P95 latency dưới 3,000 ms để bảo vệ trải nghiệm chat tương tác.
  - Error rate dưới 2%.
  - Daily cost dưới 2.5 USD.
  - Quality score trung bình từ 0.75 trở lên.
- Alert rules và runbook:
  - `high_chat_latency_p95`: P95 > 3,000 ms trong 5 phút.
  - `elevated_chat_error_rate`: error rate > 5% trong 3 phút.
  - `daily_ai_cost_budget_exceeded`: daily cost > 2.5 USD.
  - Runbook tương ứng tại [`docs/alerts.md`](../docs/alerts.md), dùng quy trình Metrics → Trace → Log và mitigation phù hợp.

## 6. Điều tra challenge

- Challenge ID: `day13-k4-observability-v1`.
- Triệu chứng từ metrics: trong challenge, P95 và P99 đều là 3,600 ms, vượt SLO P95 3,000 ms — [metrics-rag-slow.png](evidence/metrics-rag-slow.png).
- Trace ID liên quan: `c90cb42dc4825430f7f9b271f8b000b7` — [challenge-trace-retrieve-slow.png](evidence/challenge-trace-retrieve-slow.png).
- Log/correlation ID liên quan: `req-d5a50490`. Log `response_sent` có `latency_ms: 3600`; request thuộc session `k4-challenge-s01` — [challenge-log-req-d5a50490.png](evidence/challenge-log-req-d5a50490.png), [challenge-correlated-logs.txt](evidence/challenge-correlated-logs.txt).
- Root cause: incident `rag_slow` làm span `retrieve` chậm khoảng 2.50s; span `generate` chỉ khoảng 0.15s. Bằng chứng metrics, trace và log cùng trỏ tới request `req-d5a50490`.
- Fix action: tắt incident; kiểm tra vector store/retrieval, thêm timeout và fallback; cache kết quả retrieval hoặc tối ưu truy vấn dữ liệu.
- Preventive measure: theo dõi latency riêng cho `retrieve`, alert P95/P99, health check retrieval, circuit breaker và load test định kỳ.

## 7. Đóng góp cá nhân

| Thành viên | Phần việc | Commit/PR | Điều đã học |
|---|---|---|---|
| Trương Minh Tâm — Logging & Middleware | Correlation ID middleware, xoá context cũ mỗi request, response headers và enrichment `user_id_hash`, `session_id`, `feature`, `model`, `env`. | [e12e50b](https://github.com/TamKudo/K4-Day13-2A202602005/commit/e12e50b) | Context propagation, request tracing và hashing user ID. |
| Trần Hoàng Khôi — Security & Compliance | Bật PII processor, redaction đệ quy cho payload lồng nhau, regex phone/CCCD/passport/address/card và tests. | [d9094a7](https://github.com/TamKudo/K4-Day13-2A202602005/commit/d9094a7) | PII scrubbing toàn cục và kiểm thử redaction. |
| Phạm Hải Yến — Metrics & Alerting | `error_rate_pct`, Langfuse prompt metadata, SLO, alert rules, runbook và prompt rollout/rollback. | [5941d28](https://github.com/TamKudo/K4-Day13-2A202602005/commit/5941d28) | Thiết kế SLI/SLO, symptom-based alert và trace metadata. |
| Trần Văn Toàn — QA & Incident Analyst | Load test, dashboard 6 panel, evidence, challenge `rag_slow` và báo cáo điều tra. | [4f57949](https://github.com/TamKudo/K4-Day13-2A202602005/commit/4f57949) | Điều tra Metrics → Trace → Log và báo cáo root cause. |
