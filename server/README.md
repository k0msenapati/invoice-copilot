# Server API

This is the API server that processes uploaded invoices. It reads text using OCR (Optical Character Recognition), uses Groq AI to extract structured details (like amounts, tax, dates, and line items), and saves them to a local SQLite database.

## Features
* **OCR Text Scanning:** Parses text from PDFs and images using RapidOCR and PyMuPDF.
* **AI Extraction:** Connects to Groq to extract structured fields into a clean JSON structure using the Instructor library.
* **Local Database:** Stores invoice data and line items in a local SQLite file using SQLModel.
* **REST APIs:** Enpoints to upload invoices, list invoices, and manage invoice data.

## Tech Stack
* **FastAPI:** Modern Python web framework.
* **SQLModel & SQLite:** ORM and lightweight database.
* **RapidOCR & PyMuPDF:** Fast PDF and image text scanning.
* **Groq & Instructor:** AI-driven text understanding.
* **UV:** Extremely fast Python package installer and runner.

## Setup
1. Make sure you have [uv](https://github.com/astral-sh/uv) installed.
2. Open your terminal in the `server` folder.
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Edit the new `.env` file and put in your Groq API key:
   ```env
   GROQ_API_KEY=your_key_here
   ```
5. Install dependencies:
   ```bash
   uv sync
   ```
6. Start the API server:
   ```bash
   uv run fastapi dev app/main.py
   ```
   The backend will run on `http://localhost:8000`.
