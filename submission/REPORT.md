# Báo cáo Day 13 Observability

## 1. Thông tin nhóm

- Tên nhóm: Nhóm alpha
- Repository URL: https://github.com/TamKudo/K4-Day13-2A202602005
- Commit SHA cuối: 4f57949c61012ad460a4d52d37f43b08c7ad338a
- Thành viên và vai trò: 
  - Phạm Hải Yến — 2A202601152 (Metrics & Alerting)
  - Trần Hoàng Khôi — 2A202601778 (Security & Compliance)
  - Trần Văn Toàn — 2A202601218 (QA & Incident Analyst)
  - Trương Minh Tâm — 2A202602005 (Logging & Middleware)

## 2. Kết quả kỹ thuật

- Điểm `validate_logs.py` (evidence):
  - Baseline (trước khi implement CP1, 2026-08-11): 30/100 — Total records: 21, Missing required fields: 20, Missing enrichment: 20, Unique correlation IDs: 0, PII leaks: 0
  - Sau khi implement CP1 (2026-08-11): 100/100 — Total records: 190, Missing required fields: 0, Missing enrichment: 0, Unique correlation IDs: 10, PII leaks: 0
  - Ảnh bằng chứng: [validate-logs-final.png](submission/evidence/validate-logs-final.png)

- Tổng số traces: (xem evidence traces trong thư mục evidence — ví dụ trace-baseline, trace-candidate, production-on-v2)
- Số PII leak còn lại: 0 (theo kết quả validate_logs và ảnh evidence)
- Dashboard (local) [dashboard-six-panels.png](submission/evidence/dashboard-six-panels.png)

## 3. Logging và tracing

- Evidence correlation ID:
  - Ví dụ correlation_id trong logs challenge: `req-d5a50490` (xem challenge-log-req-d5a50490.png)
  - Ví dụ correlation_id cho bản test redaction: `req-c83c2651` (xem log-correlation-pii-redaction.png)
  - Ảnh bằng chứng: [challenge-log-req-d5a50490.png](submission/evidence/challenge-log-req-d5a50490.png), [log-correlation-pii-redaction.png](submission/evidence/log-correlation-pii-redaction.png)

- Evidence PII redaction:
  - Trong một bản ghi payload, email đã được redacted: "My email is [REDACTED_EMAIL]" (xem ảnh trên). Điều này chứng minh pipeline scrubbing hoạt động.

- Evidence trace waterfall:
  - Trace baseline: [trace-baseline.png](submission/evidence/trace-baseline.png)
  - Trace candidate: [trace-candidate.png](submission/evidence/trace-candidate.png)
  - Trace normal / reference: [trace-normal-latency-reference.png](submission/evidence/trace-normal-latency-reference.png)
  - Trace challenge (retrieve slow): [challenge-trace-retrieve-slow.png](submission/evidence/challenge-trace-retrieve-slow.png)
  - Production evidence (on v2 / rollback): [production-on-v2.png](submission/evidence/production-on-v2.png), [production-rollback-evidence.png](submission/evidence/production-rollback-evidence.png)

- Giải thích một span đáng chú ý:
  - Vấn đề: ở trace challenge `req-d5a50490` (challenge-trace) thấy tổng latency ~3.60s, trong đó span `retrieve` chiếm ~2.50s — cho thấy bước truy xuất (retrieval) là yếu tố chính gây chậm.
  - Hậu quả: người dùng thấy thời gian phản hồi lớn hơn SLO P95 (dashboard chỉ P95 ~2.654s trong ảnh), dẫn đến điều tra và trigger alert.
  - Hành động tạm thời/đã thực hiện: rollback prompt label về phiên bản production/baseline (xem production-rollback-evidence.png và production-rollback-v1.png).

## 4. Prompt versioning

- Prompt name: `day13-chat` (evidence: prompt-versions-list.png)
- Version/label baseline: `production` / `baseline` (version #1 shown as production/baseline)
- Version/label candidate: `candidate` / version #2 (evidence: prompt-versions-list.png, trace-candidate shows prompt_label "candidate")
- Trace ID / session evidence của mỗi version: các ảnh trace chứa nhãn session/prompt_label (ví dụ trace-baseline, trace-candidate, production-on-v2) — xem các file trong /submission/evidence
- Bằng chứng đổi label hoặc rollback:
  - Bằng chứng rollback: [production-rollback-v1.png](submission/evidence/production-rollback-v1.png), [production-rollback-evidence.png](submission/evidence/production-rollback-evidence.png)

## 5. Dashboard, SLO và alerts

- Kết quả `validate_dashboard.py`:
  - Script báo: "HỢP LỆ: 6/6 panel có trong dashboard contract." (evidence: validate-dashboard-final.png)
  - Ảnh bằng chứng: [validate-dashboard-final.png](submission/evidence/validate-dashboard-final.png)

- Evidence dashboard: [dashboard-six-panels.png](submission/evidence/dashboard-six-panels.png) (hiển thị P95, throughput, errors=0%, cost, tokens, quality=0.88)

- SLO đã chọn và lý do:
  - Latency: P95 < 3,000 ms (dựa trên dashboard; P95 hiển thị ~2.654s)
  - Error rate: < 2% (dashboard hiển thị 0%)
  - Quality (response quality): >= 0.75 (dashboard hiển thị 0.88)
  - Lý do: cân bằng giữa trải nghiệm người dùng (latency & quality) và chi phí API/token.

- Alert rules và runbook (tóm tắt đề xuất):
  - Alert nếu P95 > 3s hoặc Error rate > 2% hoặc Quality < 0.75.
  - Runbook ngắn: (1) xác định trace/trace-id bằng correlation_id từ logs, (2) kiểm tra step có latency cao (ví dụ retrieve), (3) tạm thời rollback prompt/version nếu mới deploy, (4) mở ticket tối ưu retrieval hoặc cache.

## 6. Điều tra challenge

- Challenge ID: req-d5a50490` (xem challenge-log-req-d5a50490.png và challenge-trace-retrieve-slow.png)
- Triệu chứng từ metrics:
  - P95 vượt gần tới giới hạn SLO (dashboard hiển thị P95 ~2.654s; một số request P99 ~3.018s)
  - Một trace xuất hiện latency 3.60s
  - Ảnh metrics/trace liên quan: [dashboard-six-panels.png](submission/evidence/dashboard-six-panels.png), [metrics-rag-slow.png](submission/evidence/metrics-rag-slow.png)

- Trace ID liên quan: (xem ảnh trace, ví dụ challenge-trace-retrieve-slow.png)

- Log line/correlation ID liên quan:
  - request_received log: correlation_id `req-d5a50490` (xem challenge-log-req-d5a50490.png)
  - response_sent log: có "latency_ms": 3600, "quality_score": 0.8, tokens, cost_usd

- Root cause:
  - Bước retrieval (external retrieval / datastore) chiếm phần lớn latency (retrieve ~2.50s trong trace), làm tổng latency vượt SLO.

- Fix action:
  - Tạm thời rollback prompt/version nếu phiên bản mới làm thay đổi luồng hoặc tăng tải (đã có bằng chứng rollback)
  - Triển khai cache cho kết quả retrieval hoặc tối ưu truy vấn
  - Kiểm tra và tối ưu connection / timeouts tới nguồn dữ liệu

- Preventive measure:
  - Thêm alert P95/P99 và alert theo correlation_id để tự động thu thập trace/log khi alert kích hoạt
  - Thêm health check cho service retrieval và circuit-breaker
  - Định kỳ chạy validate_logs và validate_dashboard để đảm bảo contract

## 7. Đóng góp cá nhân

Với mỗi thành viên, ghi rõ nhiệm vụ và link commit/PR tương ứng.

| Thành viên | Phần việc | Commit/PR | Điều đã học |
|---|---|---|---|
| Trương Minh Tâm — Logging & Middleware | Hoàn thiện luồng correlation ID cho mỗi request: middleware phải xóa context cũ, đọc `x-request-id` từ header hoặc tự sinh theo dạng `req-<8 ký tự hex>`, bind ID này vào structlog và trả lại qua header `x-request-id` cùng `x-response-time-ms`. Trong endpoint `/chat` bind metadata dùng chung: `user_id_hash`, `session_id`, `feature`, `model`, `env` (không ghi raw `user_id`). Files: `app/middleware.py`, `app/main.py`. | [https://github.com/TamKudo/K4-Day13-2A202602005](https://github.com/TamKudo/K4-Day13-2A202602005) — (Repo/PR) Bàn giao khi API chạy + load test và log API có correlation ID hợp lệ, metadata đầy đủ, tối thiểu hai correlation ID khác nhau; headers `x-request-id` và `x-response-time-ms` xuất hiện. | Middleware, structlog context propagation, header-based tracing, bảo mật user_id (hashing) |
| Trần Hoàng Khôi — Security & Compliance | Bảo vệ dữ liệu nhạy cảm trong log: bật `scrub_event` trong cấu hình structlog, mở rộng regex PII (email, điện thoại VN, CCCD, passport, địa chỉ VN, số thẻ test), và xử lý đệ quy chuỗi payload lồng nhau để scrub mọi mức. Files: `app/logging_config.py`, `app/pii.py` và bổ sung tests. | [https://github.com/TamKudo/K4-Day13-2A202602005](https://github.com/TamKudo/K4-Day13-2A202602005) — (Repo/PR) Bàn giao khi `validate_logs.py` ≥ 80/100 (mục tiêu 100/100) với logs chứng minh PII đã bị che; không có `user_id` thô xuất hiện. | PII scrubbing, regex nâng cao, cấu hình structlog, test cho scrub đệ quy |
| Phạm Hải Yến — Metrics & Alerting | Cấu hình tracing/metrics/SLO/alerts: cấu hình Langfuse trong `.env` (không commit key); tạo prompt `day13-chat` v1/v2 và sử dụng labels `baseline`, `candidate`, `production` — thực hiện chuyển label & rollback có bằng chứng. Bổ sung `error_rate_pct` vào endpoint `/metrics`, hoàn thiện `config/slo.yaml`, `config/alert_rules.yaml` và `docs/alerts.md`. Files chính: `app/metrics.py`, `config/slo.yaml`, `config/alert_rules.yaml`, `docs/alerts.md`. | [https://github.com/TamKudo/K4-Day13-2A202602005](https://github.com/TamKudo/K4-Day13-2A202602005) — (Repo/PR) Bàn giao khi có ≥10 trace Langfuse với metadata prompt, evidence hai phiên bản prompt và rollback; `/metrics` trả về `error_rate_pct`; tất cả TODO trong alert/runbook được thay thế. | Tracing, SLO design, alert rule/runbook, Langfuse prompt versioning |
| Trần Văn Toàn — QA & Incident Analyst | Tạo dữ liệu kiểm thử và dashboard; sau khi A & B merge, chạy API và `scripts/load_test.py` để tạo `data/logs.jsonl` sạch, đủ correlation ID và metadata. Dựng dashboard theo `config/dashboard.yaml` (6 panel: latency, traffic, error rate, cost, tokens, quality). Thực hiện challenge `rag_slow` bằng `load_test.py --challenge --concurrency 5` và điều tra theo Metrics→Trace→Logs. Files: `scripts/load_test.py`, `submission/evidence/`, `submission/REPORT.md`. | [https://github.com/TamKudo/K4-Day13-2A202602005](https://github.com/TamKudo/K4-Day13-2A202602005) — (Repo/PR) Bàn giao khi lưu kết quả hai validator, ảnh dashboard, evidence challenge và report đầy đủ: challenge ID, trace ID, correlation ID/log line, root cause, fix action, preventive measure. | Tạo dữ liệu test, dashboarding, incident investigation, kết nối logs→traces→metrics |


