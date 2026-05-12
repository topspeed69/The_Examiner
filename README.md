# The Examiner: Socratic Code Interrogation

A multi-agent Socratic interrogation tool designed to evaluate engineering artefacts (code, papers, designs) via NVIDIA NIM-hosted models.

## 🚀 Quick Start

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
- **Backend**: SSE (Server-Sent Events), NVIDIA NIM API.
- **Agents**: Multi-agent orchestration (Classifier, Teacher, GapAnalyst).
