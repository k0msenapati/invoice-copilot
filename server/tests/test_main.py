from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)


@patch("app.main.extract_text_from_file")
def test_ocr_upload_endpoint(mock_extract):
    mock_extract.return_value = "Mocked OCR text result from endpoint test"

    file_payload = {"file": ("test_invoice.pdf", b"mock pdf bytes", "application/pdf")}
    response = client.post("/api/ocr", files=file_payload)

    assert response.status_code == 200
    json_data = response.json()
    assert json_data["filename"] == "test_invoice.pdf"
    assert json_data["text"] == "Mocked OCR text result from endpoint test"
    assert json_data["size_bytes"] == len(b"mock pdf bytes")
    mock_extract.assert_called_once_with(b"mock pdf bytes", "test_invoice.pdf")
