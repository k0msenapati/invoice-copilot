# Client Dashboard

This is the frontend interface where you can upload invoice files and view all the extracted invoice details in a clean, modern dashboard.

## Features
* **File Drag-and-Drop:** Drop invoices directly to upload them.
* **Invoice List:** View, search, and filter through all your saved invoices.
* **Detailed Views:** Expand any invoice to see totals, dates, and full itemized tables.
* **Responsive Design:** Dark-themed UI that works well on different screen sizes.

## Tech Stack
* **React + TypeScript:** For the UI components and type safety.
* **Vite:** Fast development server and build tool.
* **Tailwind CSS & Shadcn UI:** For clean and custom styling.
* **React Query & Axios:** To handle API requests and cache server data.

## Setup
1. Make sure you have [Bun](https://bun.sh) installed.
2. Open your terminal in the `client` folder.
3. Install dependencies:
   ```bash
   bun install
   ```
4. Start the app:
   ```bash
   bun run dev
   ```
5. Open your browser to the URL printed in the terminal (usually `http://localhost:5173`).
