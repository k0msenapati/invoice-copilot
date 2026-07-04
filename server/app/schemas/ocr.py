from pydantic import BaseModel


class OcrResponse(BaseModel):
    filename: str
    text: str
    size_bytes: int
