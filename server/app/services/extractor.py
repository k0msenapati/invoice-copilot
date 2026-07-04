import instructor
from groq import Groq
from app.core.config import settings
from pydantic import BaseModel, Field
from typing import List, Optional


class InvoiceItemExtraction(BaseModel):
    description: str = Field(description="Description of the item or service")
    quantity: Optional[int] = Field(None, description="Quantity of items")
    unit_price: Optional[float] = Field(None, description="Price per unit of the item")
    amount: Optional[float] = Field(None, description="Total amount for this item line")


class InvoiceExtraction(BaseModel):
    invoice_number: Optional[str] = Field(None, description="The invoice number/ID")
    sender_name: str = Field(
        description="Name of the company or vendor sending the invoice"
    )
    sender_address: Optional[str] = Field(
        None, description="Address of the sender/vendor"
    )
    recipient_name: Optional[str] = Field(
        None, description="Name of the person or company receiving the invoice"
    )
    recipient_address: Optional[str] = Field(
        None, description="Address of the recipient"
    )
    invoice_date: Optional[str] = Field(
        None, description="The date the invoice was issued (YYYY-MM-DD or raw format)"
    )
    due_date: Optional[str] = Field(
        None, description="The payment due date (YYYY-MM-DD or raw format)"
    )
    currency: str = Field(
        "USD", description="The 3-letter currency code, e.g. USD, EUR, GBP"
    )
    total_amount: float = Field(description="The total balance due on the invoice")
    tax_amount: Optional[float] = Field(
        None, description="The tax amount on the invoice"
    )
    items: List[InvoiceItemExtraction] = Field(
        default=[], description="List of line items on the invoice"
    )


def extract_invoice_data(raw_text: str) -> InvoiceExtraction:
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set in the environment or .env file")

    client = instructor.from_groq(
        Groq(api_key=settings.GROQ_API_KEY), mode=instructor.Mode.JSON
    )

    extracted_data = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "system",
                "content": "You are an expert invoice parser. Extract structured fields from the raw OCR text.",
            },
            {
                "role": "user",
                "content": f"Here is the raw text of the invoice:\n\n{raw_text}",
            },
        ],
        response_model=InvoiceExtraction,
        temperature=0.1,
    )
    return extracted_data
