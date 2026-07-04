from sqlmodel import Session
from app.models import Invoice, InvoiceItem
from app.services.ocr import extract_text_from_file
from app.services.extractor import extract_invoice_data
from app.repository import invoices as invoice_repo


def process_invoice_file(session: Session, file_bytes: bytes, filename: str) -> Invoice:
    raw_text = extract_text_from_file(file_bytes, filename)
    extracted_data = extract_invoice_data(raw_text)

    db_invoice = Invoice(
        invoice_number=extracted_data.invoice_number,
        sender_name=extracted_data.sender_name,
        sender_address=extracted_data.sender_address,
        recipient_name=extracted_data.recipient_name,
        recipient_address=extracted_data.recipient_address,
        invoice_date=extracted_data.invoice_date,
        due_date=extracted_data.due_date,
        currency=extracted_data.currency,
        total_amount=extracted_data.total_amount,
        tax_amount=extracted_data.tax_amount,
        raw_text=raw_text,
    )

    items = [
        InvoiceItem(
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price,
            amount=item.amount,
        )
        for item in extracted_data.items
    ]

    return invoice_repo.create_invoice(session, db_invoice, items)
