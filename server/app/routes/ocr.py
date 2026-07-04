from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.ocr import OcrResponse
from app.services.ocr import extract_text_from_file

router = APIRouter(prefix="/api/ocr", tags=["OCR"])


@router.post("", response_model=OcrResponse)
async def perform_ocr(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    try:
        contents = await file.read()
        extracted_text = extract_text_from_file(contents, file.filename)
        return OcrResponse(
            filename=file.filename,
            text=extracted_text,
            size_bytes=len(contents),
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e
