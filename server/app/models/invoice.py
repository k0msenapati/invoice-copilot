# ruff: noqa: E402
from datetime import datetime, timezone
from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship


class InvoiceBase(SQLModel):
    invoice_number: Optional[str] = None
    sender_name: str
    sender_address: Optional[str] = None
    recipient_name: Optional[str] = None
    recipient_address: Optional[str] = None
    invoice_date: Optional[str] = None
    due_date: Optional[str] = None
    currency: str = "USD"
    total_amount: float
    tax_amount: Optional[float] = None


class Invoice(InvoiceBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    raw_text: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    items: List["InvoiceItem"] = Relationship(
        back_populates="invoice",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


from app.models.invoice_item import InvoiceItem
