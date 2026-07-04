from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.ocr import extract_text_from_file

app = FastAPI(title="Invoice Copilot API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    """Upload an invoice file (PDF/Image) and extract the raw text using OCR."""
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    try:
        contents = await file.read()
        extracted_text = extract_text_from_file(contents, file.filename)
        return {
            "filename": file.filename,
            "text": extracted_text,
            "size_bytes": len(contents),
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e
