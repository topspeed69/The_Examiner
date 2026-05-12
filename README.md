# The Examiner: Socratic Code Interrogation

A multi-agent Socratic interrogation tool designed to evaluate engineering artefacts (code, papers, designs) via NVIDIA NIM-hosted models.

## 🚀 Quick Start

### 1. Backend Configuration
The backend is a FastAPI proxy that handles streaming inference from NVIDIA NIM.

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```
2.  **Set up environment variables**:
    Create a `.env` file based on `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Add your `NIM_API_KEY` to the `.env` file.
3.  **Run the backend**:
    We use `uv` for lightning-fast Python dependency management.
    ```bash
    uv run main.py
    ```
    The server will start at `http://localhost:8001`.

### 2. Frontend Configuration
The frontend is a React + Vite application with a Cyberpunk Terminal aesthetic.

1.  **Navigate to the root directory**:
    ```bash
    cd ..
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

## 🛠️ Testing the Pipeline

1.  **Entry Portal**: Paste a code snippet or design doc into the main terminal.
2.  **Initiate**: Click `INITIATE_EXAMINATION`. The system will classify the artefact and start the Socratic loop.
3.  **Respond**: Answer the Examiner's questions. If you exhibit a "gap" in understanding, the **Teach Mode** will activate.
4.  **Report**: After the rounds are complete, view the **Gap Map** for a full diagnostic of your conceptual ownership.

## 🧰 Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Mermaid.js (Diagrams), Lucide (Icons).
- **Backend**: FastAPI, SSE (Server-Sent Events), NVIDIA NIM API.
- **Agents**: Multi-agent orchestration (Classifier, Teacher, GapAnalyst).
