# Invoice Copilot

An AI-powered web app to scan invoices, extract data, and view them in a dashboard.

## What is it?
Invoice Copilot is a tool that takes invoice files (PDFs or images), extracts the text, uses AI to pull out structured data (like total, tax, items, and sender info), and stores it in a local database for you to view on a dashboard.

## Demo
<a href="https://www.youtube.com/watch?v=907lnE1Rn4A">
  <img
    src="https://img.youtube.com/vi/907lnE1Rn4A/maxresdefault.jpg"
    alt="Watch the video"
    width="420">
</a>

## Features
* **File Upload:** Upload PDF, PNG, JPG, or JPEG invoices.
* **Text Scanning (OCR):** Reads text from documents automatically.
* **AI Extraction:** Uses Groq AI to parse complex invoice tables and fields.
* **Dashboard:** A clean UI to see, search, and manage all your invoices.

## Tech Stack
* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Shadcn UI
* **Backend:** FastAPI, Python, SQLModel, SQLite, RapidOCR, PyMuPDF, Groq, Instructor
* **Package Managers:** Bun (Frontend), UV (Backend)

## Setup
1. Clone the project.
2. Go to the [server README](./server/README.md) to set up the backend.
3. Go to the [client README](./client/README.md) to set up the frontend.
