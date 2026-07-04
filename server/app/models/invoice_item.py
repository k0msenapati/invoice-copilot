from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from app.models.invoice import Invoice


class InvoiceItemBase(SQLModel):
    description: str
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    amount: Optional[float] = None


class InvoiceItem(InvoiceItemBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    invoice_id: int = Field(foreign_key="invoice.id", ondelete="CASCADE")

    invoice: "Invoice" = Relationship(back_populates="items")
