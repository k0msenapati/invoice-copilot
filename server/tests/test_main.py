import pytest
from unittest.mock import patch
from sqlmodel import SQLModel, create_engine, Session
from sqlmodel.pool import StaticPool
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import get_session
from app.models import Invoice, InvoiceItem
from app.services.extractor import InvoiceExtraction, InvoiceItemExtraction


@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@patch("app.routes.ocr.extract_text_from_file")
def test_ocr_upload_endpoint(mock_extract, client: TestClient):
    mock_extract.return_value = "Mocked OCR text result from endpoint test"

    file_payload = {"file": ("test_invoice.pdf", b"mock pdf bytes", "application/pdf")}
    response = client.post("/api/ocr", files=file_payload)

    assert response.status_code == 200
    json_data = response.json()
    assert json_data["filename"] == "test_invoice.pdf"
    assert json_data["text"] == "Mocked OCR text result from endpoint test"
    assert json_data["size_bytes"] == len(b"mock pdf bytes")
    mock_extract.assert_called_once_with(b"mock pdf bytes", "test_invoice.pdf")


def test_list_invoices_empty(client: TestClient):
    response = client.get("/api/invoices")
    assert response.status_code == 200
    assert response.json() == []


@patch("app.services.invoices.extract_text_from_file")
@patch("app.services.invoices.extract_invoice_data")
def test_process_invoice_success(
    mock_extract_data, mock_ocr, client: TestClient, session: Session
):
    mock_ocr.return_value = "Mocked Raw OCR Invoice Text Content"

    mock_extract_data.return_value = InvoiceExtraction(
        invoice_number="INV-2026-001",
        sender_name="Acme Corp",
        sender_address="123 Road",
        recipient_name="John Doe",
        recipient_address="456 St",
        invoice_date="2026-07-04",
        due_date="2026-08-04",
        currency="USD",
        total_amount=150.0,
        tax_amount=10.0,
        items=[
            InvoiceItemExtraction(
                description="Consulting Services",
                quantity=2,
                unit_price=70.0,
                amount=140.0,
            ),
            InvoiceItemExtraction(
                description="Late Fee", quantity=None, unit_price=None, amount=10.0
            ),
        ],
    )

    file_payload = {
        "file": ("invoice.pdf", b"mock invoice contents", "application/pdf")
    }
    response = client.post("/api/invoices/process", files=file_payload)

    assert response.status_code == 200
    json_data = response.json()
    assert json_data["invoice_number"] == "INV-2026-001"
    assert json_data["sender_name"] == "Acme Corp"
    assert json_data["total_amount"] == 150.0
    assert len(json_data["items"]) == 2
    assert json_data["items"][0]["description"] == "Consulting Services"
    assert json_data["items"][0]["quantity"] == 2

    db_invoices = session.exec(select_invoice()).all()
    assert len(db_invoices) == 1
    assert db_invoices[0].invoice_number == "INV-2026-001"


def select_invoice():
    from sqlmodel import select

    return select(Invoice)


def test_get_invoice_not_found(client: TestClient):
    response = client.get("/api/invoices/999")
    assert response.status_code == 404


def test_get_invoice_success(client: TestClient, session: Session):
    db_invoice = Invoice(
        invoice_number="INV-777",
        sender_name="Test Vendor",
        total_amount=250.0,
        raw_text="vendor text",
    )
    session.add(db_invoice)
    session.commit()
    session.refresh(db_invoice)

    db_item = InvoiceItem(invoice_id=db_invoice.id, description="Item 1", amount=250.0)
    session.add(db_item)
    session.commit()

    response = client.get(f"/api/invoices/{db_invoice.id}")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["invoice_number"] == "INV-777"
    assert len(json_data["items"]) == 1
    assert json_data["items"][0]["description"] == "Item 1"


def test_update_invoice_success(client: TestClient, session: Session):
    db_invoice = Invoice(
        invoice_number="OLD-NUM",
        sender_name="Old Name",
        total_amount=100.0,
        raw_text="raw",
    )
    session.add(db_invoice)
    session.commit()
    session.refresh(db_invoice)

    db_item = InvoiceItem(
        invoice_id=db_invoice.id, description="Old Item", amount=100.0
    )
    session.add(db_item)
    session.commit()

    update_payload = {
        "invoice_number": "NEW-NUM",
        "sender_name": "New Name",
        "total_amount": 120.0,
        "items": [
            {
                "description": "New Item",
                "quantity": 1,
                "unit_price": 120.0,
                "amount": 120.0,
            }
        ],
    }

    response = client.put(f"/api/invoices/{db_invoice.id}", json=update_payload)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["invoice_number"] == "NEW-NUM"
    assert json_data["sender_name"] == "New Name"
    assert len(json_data["items"]) == 1
    assert json_data["items"][0]["description"] == "New Item"

    old_items = session.exec(select_items_by_invoice(db_invoice.id)).all()
    assert len(old_items) == 1
    assert old_items[0].description == "New Item"


def select_items_by_invoice(invoice_id: int):
    from sqlmodel import select

    return select(InvoiceItem).where(InvoiceItem.invoice_id == invoice_id)


def test_delete_invoice_success(client: TestClient, session: Session):
    db_invoice = Invoice(
        invoice_number="DEL-NUM",
        sender_name="Del Vendor",
        total_amount=50.0,
        raw_text="del text",
    )
    session.add(db_invoice)
    session.commit()
    session.refresh(db_invoice)

    db_item = InvoiceItem(invoice_id=db_invoice.id, description="Del Item", amount=50.0)
    session.add(db_item)
    session.commit()

    response = client.delete(f"/api/invoices/{db_invoice.id}")
    assert response.status_code == 200
    assert response.json()["detail"] == f"Invoice {db_invoice.id} deleted successfully."

    assert session.get(Invoice, db_invoice.id) is None

    items = session.exec(select_items_by_invoice(db_invoice.id)).all()
    assert len(items) == 0
