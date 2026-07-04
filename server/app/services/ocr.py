import fitz  # PyMuPDF
from pypdf import PdfReader
from PIL import Image
from io import BytesIO
import numpy as np
from rapidocr_onnxruntime import RapidOCR

_ocr_engine = None


def get_ocr_engine():
    global _ocr_engine
    if _ocr_engine is None:
        _ocr_engine = RapidOCR()
    return _ocr_engine


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    try:
        reader = PdfReader(BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"

        if len(text.strip()) > 50:
            return text.strip()
    except Exception as e:
        print(f"pypdf extraction failed, falling back to OCR: {e}")

    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        ocr_text = []
        engine = get_ocr_engine()
        for page in doc:
            pix = page.get_pixmap(dpi=150)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            result, _ = engine(np.array(img))
            if result:
                page_text = "\n".join([line[1] for line in result])
                ocr_text.append(page_text)
        return "\n\n".join(ocr_text).strip()
    except Exception as e:
        print(f"PDF OCR extraction failed: {e}")
        return ""


def extract_text_from_image(image_bytes: bytes) -> str:
    try:
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        engine = get_ocr_engine()
        result, _ = engine(np.array(img))
        if result:
            return "\n".join([line[1] for line in result]).strip()
        return ""
    except Exception as e:
        print(f"Image OCR extraction failed: {e}")
        return ""


def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    filename_lower = filename.lower()
    if filename_lower.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif filename_lower.endswith((".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff")):
        return extract_text_from_image(file_bytes)
    else:
        try:
            return file_bytes.decode("utf-8")
        except UnicodeDecodeError as e:
            raise ValueError("Unsupported file format for text extraction.") from e
