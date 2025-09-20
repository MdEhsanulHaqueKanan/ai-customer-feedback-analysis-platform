---
title: AI Customer Feedback Analysis Platform
emoji: 📊
colorFrom: blue
colorTo: green
sdk: docker
pinned: true
---

# AI-Powered Customer Feedback & Product Insight Platform

![Python](https://img.shields.io/badge/Python-3.10-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.1.2-000000?style=for-the-badge&logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-19.1-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-2.3.2-150458?style=for-the-badge&logo=pandas&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB-1.0.20-5B33F9?style=for-the-badge)
![Groq](https://img.shields.io/badge/Groq-0.31.1-00C599?style=for-the-badge)
![Tesseract OCR](https://img.shields.io/badge/Tesseract-5.x-5CB2E2?style=for-the-badge)

An end-to-end, full-stack platform that transforms unstructured customer feedback from multiple sources into a dynamic, queryable, and actionable business intelligence dashboard.

![Feedback AI Platform Screenshot](./assets/Feedback%20AI%20Dashboard.png)

---

### 🔴 Live Demo

**[Link to your deployed application]** *(We will add this once deployed)*

### ✨ Key Features in Action

**Dynamic Dashboard & Document Ingestion**

The dashboard provides a real-time overview of customer sentiment. Watch as a new document is uploaded, intelligently processed, and its contents are immediately reflected in the charts and recent feedback list.

![Dynamic Dashboard Demo](./assets/Feedback%20AI%20Dashboard.gif)

**Conversational AI Assistant (RAG with Filtering)**

Ask complex questions in natural language. The AI assistant can query the entire 10,000+ review knowledge base or, with a single click, focus its search exclusively on the content of your uploaded documents to provide precise, context-aware answers.

![AI Assistant Demo](./assets/Feedback%20AI%20Chatbot.gif)

---

### 📊 Project Scope & Performance

This project was built and validated on a substantial and realistic dataset to ensure robust performance.

*   **Initial Knowledge Base:** The system was initialized with a dataset of **10,000 real-world apparel reviews** from Amazon.
*   **Dynamic Data Ingestion:** The platform can ingest and process multi-page documents (`.docx`, `.pdf`) in real-time.
*   **Intelligent Chunking Performance:** The `llama3-70b-versatile` model successfully parsed and extracted **8 distinct feedback items** from the Q3 report and **7 items** from the Q4 report, including sentiment classification for each.
*   **RAG Knowledge Base:** The final ChromaDB vector database contains **10,015 queryable feedback items** (9,999 from the initial dataset + 16 from the two ingested reports).
*   **High-Speed AI Assistant:** The `llama-3.1-8b-instant` model, powered by the Groq LPU™ Inference Engine, delivers conversational responses with an average **time-to-first-token of under 150ms**, providing a truly real-time chat experience.

---

### 🎯 Introduction: The Problem

Product managers and businesses are inundated with vast amounts of unstructured customer feedback from reviews, support tickets, and internal reports. Manually sifting through this data to find actionable insights is slow, inefficient, and prone to human bias. This project solves that problem by creating an automated system that ingests, analyzes, and synthesizes this feedback into a single, intelligent interface.

---

### 🚀 Core Features

*   **Dynamic Analytics Dashboard:**
    *   Visualizes real-time sentiment trends (positive, negative, neutral) from thousands of reviews.
    *   Displays topic distribution to quickly identify what customers are talking about.
    *   Features a live-updating table of the 20 most recent feedback items, with sources clearly marked.

*   **AI-Powered Document Ingestion & Analysis:**
    *   **Intelligent Chunking:** Upload unstructured documents (`.docx`, `.pdf`). The system uses a powerful LLM (`llama3-70b-versatile`) to intelligently parse the document, extract individual feedback points, and classify their sentiment.
    *   **Hybrid PDF Processing with OCR:** The system first attempts direct text extraction from PDFs. If it detects a scanned (image-based) document, it automatically falls back to a powerful **Tesseract OCR** pipeline to ensure all data is captured.
    *   **Live Dashboard Updates:** Once a document is ingested, the main dashboard **automatically refreshes in real-time**, incorporating the newly extracted feedback into all charts and tables.

*   **Conversational AI Assistant (Advanced RAG):**
    *   Ask complex, natural language questions about the entire feedback knowledge base.
    *   **Metadata Filtering:** A sophisticated search filter allows users to query the entire dataset or focus exclusively on knowledge extracted from uploaded documents, enabling precise and targeted analysis.
    *   The backend leverages a `sentence-transformers` model for embeddings and a **ChromaDB** vector database for efficient semantic search. The final answer is synthesized by a high-speed `llama-3.1-8b-instant` model via the Groq API.

---

### 🔧 Technical Deep Dive: System Architecture

This project is built as a professional, decoupled, full-stack application.

*   **Backend (Python/Flask):**
    *   Built using a scalable **Application Factory** pattern.
    *   Features a **Singleton `DataService`** to manage the dashboard's data state in-memory, allowing for real-time updates without constant database reads.
    *   The RAG pipeline is built from scratch, using `chromadb` for persistent vector storage and `groq` for high-speed LLM inference.
    *   All dependencies are managed via a `conda` environment and a universal `requirements.txt` file.

*   **Frontend (React/TypeScript):**
    *   A modern, responsive UI built with **Vite**, **React**, and **TypeScript**.
    *   Styled with **Tailwind CSS** using a reusable component architecture (`components/ui.tsx`).
    *   Features custom React hooks (`useDashboardApi`) for clean, separated data-fetching logic.
    *   Stateful components, like the AI Assistant, use `sessionStorage` to persist conversation history, providing a seamless user experience.

---

### 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | `React`, `TypeScript`, `Vite`, `Tailwind CSS`, `axios`, `recharts` |
| **Backend** | `Python`, `Flask`, `Pandas` |
| **AI / NLP** | `Groq (LLaMA 3)`, `Sentence-Transformers`, `ChromaDB`, `PyMuPDF`, `python-docx`, `Pytesseract OCR` |
| **DevOps** | `Conda`, `Git`, `npm`, `pip` |

---

### 🏃‍♂️ Getting Started: Running Locally

1.  **Clone the repository:**
    ```bash
    git clone [your-repo-url]
    cd customer-feedback-ai
    ```
2.  **Backend Setup:**
    *   Navigate to the `backend` directory: `cd backend`
    *   Create and activate the conda environment:
        ```bash
        conda env create -f environment.yml
        conda activate FeedbackAI
        ```
    *   Create a `.env` file and add your `GROQ_API_KEY`.
    *   Run the server (this will take ~10 mins on the first run to build the database):
        ```bash
        python run.py
        ```
3.  **Frontend Setup:**
    *   Open a new terminal and navigate to the `frontend` directory: `cd frontend`
    *   Install dependencies: `npm install`
    *   Run the development server: `npm run dev`

The application will be available at `http://localhost:5173`.

---

### 💡 Future Work

This project provides a powerful foundation. Future enhancements could include:

*   **V2 Computer Vision Module:** Integrating a custom-trained YOLOv8 model to analyze user-submitted images for visual defects (e.g., torn fabric, stains).
*   **Database Integration:** Migrating the in-memory `DataService` to a persistent SQL or NoSQL database to handle larger datasets and provide user authentication.
*   **Advanced RAG Techniques:** Implementing re-ranking and query transformation to further improve the accuracy of the AI Assistant.

---

### 📫 Contact

**Ehsanul Haque Kanan**
*   [LinkedIn](https://www.linkedin.com/in/ehsanulhaquekanan/)
*   [GitHub](https://github.com/MdEhsanulHaqueKanan)
*   [Website](https://ehsanul-ai-engineer.vercel.app/)