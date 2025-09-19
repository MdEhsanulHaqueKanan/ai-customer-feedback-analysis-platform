# Frontend: AI Feedback Platform

![React](https://img.shields.io/badge/React-19.1-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-3.2-8884d8?style=for-the-badge)

This directory contains the source code for the React frontend of the AI-Powered Customer Feedback Platform. It's a modern, responsive single-page application (SPA) designed to provide a seamless and intuitive user experience for analyzing complex AI-driven data.

---

### Application Screenshots

![Feedback AI Platform Screenshot](./assets/Feedback%20AI%20Dashboard.png)

### Key Features in Action

**Dynamic Dashboard & Document Ingestion**

The dashboard provides a real-time overview of customer sentiment. Watch as a new document is uploaded, intelligently processed by the backend, and its contents are immediately reflected in the charts and recent feedback list via a reactive data-fetching hook.

![Dynamic Dashboard Demo](./assets/Feedback%20AI%20Dashboard.gif)

**Conversational AI Assistant (RAG with Filtering)**

A full-featured chat interface allows users to interact with the RAG AI Assistant. The UI supports state persistence through `sessionStorage`, ensuring conversations are not lost during navigation. A dedicated filter allows for precise, targeted queries against uploaded documents.

![AI Assistant Demo](./assets/Feedback%20AI%20Chatbot.gif)

---

### ✨ Core Capabilities

*   **Dynamic Dashboard:** Features interactive charts (`recharts`) that visualize real-time sentiment and topic data from the backend.
*   **Live Data Ingestion:** Allows users to upload documents (`.docx`, `.pdf`), triggering a backend process and then automatically re-fetching data to update the UI.
*   **Conversational AI Interface:** A full-featured chat interface for interacting with the RAG AI Assistant.
*   **State Persistence:** The AI Assistant's conversation history is preserved in `sessionStorage` for a seamless user experience.
*   **Reusable Component Library:** Built with a professional component architecture (`components/ui.tsx`) and `cva` for consistent, variant-based styling.

---

### 🛠️ Tech Stack & Dependencies

*   **Framework:** React `19.1.1`
*   **Language:** TypeScript `~5.8.2`
*   **Build Tool:** Vite `^6.2.0`
*   **Styling:** Tailwind CSS (with `cva`, `clsx`, `tailwind-merge`)
*   **Data Fetching:** Axios `^1.11.0`
*   **Charting:** Recharts `^3.2.0`
*   **Animations:** Framer Motion `^12.23.12`
*   **Icons:** Lucide React `^0.543.0`

---

### 🏃‍♀️ Running Locally

1.  **Navigate to this directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    *Ensure you have Node.js and npm installed.*
    ```bash
    npm install
    ```
3.  **Run the development server:**
    *The backend server must be running first for the application to fetch data.*
    ```bash
    npm run dev
    ```
4.  The application will be available at `http://localhost:5173`.