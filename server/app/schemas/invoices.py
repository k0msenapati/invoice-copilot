from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.models import InvoiceBase, InvoiceItemBase


class InvoiceItemResponse(InvoiceItemBase):
    id: int
    invoice_id: int


class InvoiceResponse(InvoiceBase):
    id: int
    raw_text: str
    created_at: datetime
    items: List[InvoiceItemResponse] = []


class InvoiceUpdateRequest(BaseModel):
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
    items: List[InvoiceItemBase] = []
