from unittest.mock import MagicMock, patch
from app.services.ocr import extract_text_from_file


def test_extract_text_from_text_file():
    content = b"Hello world, this is a plain text file."
    text = extract_text_from_file(content, "test.txt")
    assert text == "Hello world, this is a plain text file."


@patch("app.services.ocr.PdfReader")
def test_extract_text_from_digital_pdf(mock_pdf_reader):
    mock_reader_instance = MagicMock()
    mock_page = MagicMock()
    long_text = "Digital PDF Invoice Text Content. This is a longer text that will bypass the 50 characters length check for OCR fallback."
    mock_page.extract_text.return_value = long_text
    mock_reader_instance.pages = [mock_page]
    mock_pdf_reader.return_value = mock_reader_instance

    pdf_data = b"%PDF-1.4 mock pdf data"
    text = extract_text_from_file(pdf_data, "invoice.pdf")
    assert text == long_text
    mock_pdf_reader.assert_called_once()


@patch("app.services.ocr.PdfReader")
@patch("app.services.ocr.fitz.open")
@patch("app.services.ocr.get_ocr_engine")
def test_extract_text_from_scanned_pdf(mock_get_ocr, mock_fitz_open, mock_pdf_reader):
    mock_reader_instance = MagicMock()
    mock_page_pypdf = MagicMock()
    mock_page_pypdf.extract_text.return_value = ""
    mock_reader_instance.pages = [mock_page_pypdf]
    mock_pdf_reader.return_value = mock_reader_instance

    mock_doc = MagicMock()
    mock_page_fitz = MagicMock()
    mock_pix = MagicMock()
    mock_pix.width = 100
    mock_pix.height = 100
    mock_pix.samples = b"\xff" * 30000
    mock_page_fitz.get_pixmap.return_value = mock_pix
    mock_doc.__iter__.return_value = [mock_page_fitz]
    mock_fitz_open.return_value = mock_doc

    mock_engine = MagicMock()
    mock_engine.return_value = (
        [[None, "OCR Extracted Text from PDF Page", 0.99]],
        0.1,
    )
    mock_get_ocr.return_value = mock_engine

    pdf_data = b"%PDF-1.4 mock scanned pdf data"
    text = extract_text_from_file(pdf_data, "scanned_invoice.pdf")
    assert text == "OCR Extracted Text from PDF Page"
    mock_fitz_open.assert_called_once()
    mock_engine.assert_called_once()


@patch("app.services.ocr.get_ocr_engine")
def test_extract_text_from_image(mock_get_ocr):
    with patch("app.services.ocr.Image.open") as mock_image_open:
        mock_img = MagicMock()
        mock_img.convert.return_value = mock_img
        mock_image_open.return_value = mock_img

        mock_engine = MagicMock()
        mock_engine.return_value = (
            [[None, "OCR Extracted Text from Image", 0.95]],
            0.1,
        )
        mock_get_ocr.return_value = mock_engine

        image_data = b"fake image bytes"
        text = extract_text_from_file(image_data, "photo.jpg")
        assert text == "OCR Extracted Text from Image"
        mock_image_open.assert_called_once()
        mock_engine.assert_called_once()
