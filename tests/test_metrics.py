from app.metrics import percentile
from collections import Counter

import app.metrics as metrics

def test_percentile_basic() -> None:
    assert percentile([100, 200, 300, 400], 50) >= 100

def test_snapshot_has_zero_error_rate_without_requests(monkeypatch) -> None:
    monkeypatch.setattr(metrics, "TRAFFIC", 0)
    monkeypatch.setattr(metrics, "ERRORS", Counter())
    monkeypatch.setattr(metrics, "REQUEST_LATENCIES", [])
    monkeypatch.setattr(metrics, "REQUEST_COSTS", [])
    monkeypatch.setattr(metrics, "REQUEST_TOKENS_IN", [])
    monkeypatch.setattr(metrics, "REQUEST_TOKENS_OUT", [])
    monkeypatch.setattr(metrics, "QUALITY_SCORES", [])

    assert metrics.snapshot()["error_rate_pct"] == 0.0

def test_snapshot_calculates_error_rate_from_successes_and_errors(monkeypatch) -> None:
    monkeypatch.setattr(metrics, "TRAFFIC", 2)
    monkeypatch.setattr(metrics, "ERRORS", Counter({"RuntimeError": 1}))
    monkeypatch.setattr(metrics, "REQUEST_LATENCIES", [100, 200])
    monkeypatch.setattr(metrics, "REQUEST_COSTS", [0.001, 0.002])
    monkeypatch.setattr(metrics, "REQUEST_TOKENS_IN", [10, 20])
    monkeypatch.setattr(metrics, "REQUEST_TOKENS_OUT", [30, 40])
    monkeypatch.setattr(metrics, "QUALITY_SCORES", [0.8, 0.9])

    snapshot = metrics.snapshot()

    assert snapshot["error_rate_pct"] == 33.33
    assert snapshot["error_breakdown"] == {"RuntimeError": 1}