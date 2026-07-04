from typing import List, Optional
from sqlmodel import Session, select
from app.models import Invoice, InvoiceItem
from app.schemas.invoices import InvoiceUpdateRequest


def get_all_invoices(session: Session) -> List[Invoice]:
    statement = select(Invoice).order_by(Invoice.created_at.desc())
    return session.exec(statement).all()


def get_invoice_by_id(session: Session, invoice_id: int) -> Optional[Invoice]:
    return session.get(Invoice, invoice_id)


def create_invoice(
    session: Session, invoice: Invoice, items: List[InvoiceItem]
) -> Invoice:
    session.add(invoice)
    session.commit()
    session.refresh(invoice)

    for item in items:
        item.invoice_id = invoice.id
        session.add(item)

    session.commit()
    session.refresh(invoice)
    return invoice


def update_invoice(
    session: Session, db_invoice: Invoice, payload: InvoiceUpdateRequest
) -> Invoice:
    update_data = payload.model_dump(exclude={"items"})
    for key, value in update_data.items():
        setattr(db_invoice, key, value)

    db_invoice.items.clear()
    for item in payload.items:
        db_item = InvoiceItem(
            invoice_id=db_invoice.id,
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price,
            amount=item.amount,
        )
        db_invoice.items.append(db_item)

    session.add(db_invoice)
    session.commit()
    session.refresh(db_invoice)
    return db_invoice


def delete_invoice(session: Session, db_invoice: Invoice) -> None:
    session.delete(db_invoice)
    session.commit()
