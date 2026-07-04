from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlmodel import Session
from app.core.database import get_session
from app.schemas.invoices import InvoiceResponse, InvoiceUpdateRequest
from app.services import invoices as invoices_service
from app.repository import invoices as invoice_repo

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])


@router.post("/process", response_model=InvoiceResponse)
async def process_invoice(
    file: UploadFile = File(...), session: Session = Depends(get_session)
):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    try:
        contents = await file.read()
        db_invoice = invoices_service.process_invoice_file(
            session, contents, file.filename
        )
        return db_invoice
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process invoice: {str(e)}"
        ) from e


@router.get("", response_model=List[InvoiceResponse])
async def list_invoices(session: Session = Depends(get_session)):
    return invoice_repo.get_all_invoices(session)


@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(invoice_id: int, session: Session = Depends(get_session)):
    db_invoice = invoice_repo.get_invoice_by_id(session, invoice_id)
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    return db_invoice


@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: int,
    payload: InvoiceUpdateRequest,
    session: Session = Depends(get_session),
):
    db_invoice = invoice_repo.get_invoice_by_id(session, invoice_id)
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    return invoice_repo.update_invoice(session, db_invoice, payload)


@router.delete("/{invoice_id}")
async def delete_invoice(invoice_id: int, session: Session = Depends(get_session)):
    db_invoice = invoice_repo.get_invoice_by_id(session, invoice_id)
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    invoice_repo.delete_invoice(session, db_invoice)
    return {"detail": f"Invoice {invoice_id} deleted successfully."}
