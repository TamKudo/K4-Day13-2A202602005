# Template Alert và Runbook

Mỗi alert phải dựa trên triệu chứng người dùng hoặc SLO, không dựa trực tiếp vào tên implementation nội bộ.

## Alert 1

- Tên:High chat latency P95
- Severity:warning
- SLI/SLO liên quan:
- Điều kiện và thời gian duy trì:P95 latency vượt 3000 ms trong 5 phút
- Ảnh hưởng tới người dùng:Người dùng chờ phản hồi chat lâu hoặc timeout.
- Ba bước kiểm tra đầu tiên:
    1. Kiểm tra P95 trên dashboard hoặc /metrics.
    2. Mở trace latency cao nhất, xác định span chậm nhất.
    3. Tìm correlation ID của trace trong data/logs.jsonl.
- Mitigation tạm thời:Tắt/giảm feature gây tải, rollback prompt production hoặc giảm concurrency.
- Owner:on-call engineer

## Alert 2

- Tên:Elevated chat error rate
- Severity: critical
- SLI/SLO liên quan:error_rate_pct, mục tiêu ≤ 2%
- Điều kiện và thời gian duy trì:error_rate_pct vượt 5% trong 3 phút
- Ảnh hưởng tới người dùng: Người dùng không nhận được câu trả lời.
- Ba bước kiểm tra đầu tiên:
    1. Kiểm tra error_rate_pct và error_breakdown tại /metrics.
    2. Mở trace lỗi gần nhất.
    3. Tìm request_failed theo correlation ID trong log.
- Mitigation tạm thời: Disable feature/incident lỗi, rollback thay đổi gần nhất.
- Owner: on-call engineer

## Alert 3

- Tên: Daily AI cost budget exceeded
- Severity:warning
- SLI/SLO liên quan:daily_cost_usd, mục tiêu ≤ 2.5 USD
- Điều kiện và thời gian duy trì:daily cost vượt 2.5 USD
- Ảnh hưởng tới người dùng:Không trực tiếp làm lỗi user, nhưng có nguy cơ vượt ngân sách.
- Ba bước kiểm tra đầu tiên:
    1. Kiểm tra total_cost_usd, avg_cost_usd và token totals.
    2. Mở trace có cost/token cao, kiểm tra model và prompt version.
    3. Dùng correlation ID để kiểm tra feature/request liên quan trong logs.
- Mitigation tạm thời: Rollback prompt/model, giới hạn output token, tắt tính năng gây cost spike.
- Owner:team lead
