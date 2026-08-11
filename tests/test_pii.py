from app.logging_config import scrub_event
from app.pii import scrub_text


def test_scrub_email() -> None:
    out = scrub_text("Email me at student@vinuni.edu.vn")
    assert "student@" not in out
    assert "REDACTED_EMAIL" in out


def test_scrub_common_vietnamese_phone_formats() -> None:
    phone_numbers = (
        "0901234567",
        "090 123 4567",
        "090.123.4567",
        "090-123-4567",
        "+84 90 123 4567",
    )

    for phone_number in phone_numbers:
        out = scrub_text(f"Contact: {phone_number}")
        assert phone_number not in out
        assert "REDACTED_PHONE_VN" in out


def test_scrub_additional_sensitive_identifiers() -> None:
    out = scrub_text(
        "Passport B12345678, CCCD 012345678901, card 4111 1111 1111 1111, "
        "address Số 12 đường Lê Lợi"
    )

    assert "B12345678" not in out
    assert "012345678901" not in out
    assert "4111 1111 1111 1111" not in out
    assert "Số 12 đường Lê Lợi" not in out
    assert "REDACTED_PASSPORT" in out
    assert "REDACTED_CCCD" in out
    assert "REDACTED_CREDIT_CARD" in out
    assert "REDACTED_ADDRESS_VN" in out


def test_scrub_event_redacts_nested_payloads_and_top_level_strings() -> None:
    event = {
        "event": "support request from student@vinuni.edu.vn",
        "detail": "Call 0901234567",
        "payload": {
            "customer": {"email": "student@vinuni.edu.vn"},
            "messages": ["Card 4111 1111 1111 1111"],
        },
    }

    scrubbed = scrub_event(None, "info", event)
    rendered = str(scrubbed)
    assert "student@vinuni.edu.vn" not in rendered
    assert "0901234567" not in rendered
    assert "4111 1111 1111 1111" not in rendered
