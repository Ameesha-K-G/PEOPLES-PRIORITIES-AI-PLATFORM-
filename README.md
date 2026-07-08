# People's Priorities — AI Synthesis Engine

People's Priorities is a high-performance, multilingual full-stack decision-support system designed for parliamentary constituency planning. It standardizes unstructured citizen submissions (voice transcripts, SMS, photo metadata), identifies geospatial landmarks, matches records with regional registries, and computes dynamic priority priority scores to support objective policy interventions.

---

## 🚀 Architectural Design

This app is designed as a **Full-Stack Application** using:
- **Frontend**: React (Vite, Tailwind CSS, Lucide Icons, and Motion transitions)
- **Backend**: Express Server with automatic ES Module transpilation via `esbuild`
- **AI Engine**: Google Gemini API via the `@google/genai` TypeScript SDK

---

## 🛠️ Local Installation & Development

To run this application locally on your computer:

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) installed on your system.

### 2. Extract and Install Dependencies
In your terminal, navigate to the extracted directory and run:
```bash
npm install
```

### 3. Configure Environment Secrets
Create a `.env` file in the root of the project (copying `.env.example` as a template):
```bash
cp .env.example .env
```
Inside your `.env` file, supply your own Google Gemini API key:
```env
GEMINI_API_KEY="your-actual-api-key-here"
```

### 4. Boot up the Development Server
Run the unified full-stack server locally:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## 📦 Production Builds & Compilation

To build and compile the application for safe, optimized container or server deployments:

```bash
# Compiles React static assets and bundles the Express server to dist/server.cjs
npm run build

# Runs the production compiled build
npm start
```

---

## 🤝 How to Collaborate and Invite Team Members on GitHub

If you have exported this project to GitHub and want your team members to join, follow these instructions:

1. **Go to your Repository page** on [GitHub](https://github.com).
2. Click on the **Settings** tab (the gear icon at the top navigation bar of your repository).
3. In the left-hand sidebar, click **Collaborators** (located under the **Access** category).
4. You may be prompted to enter your GitHub password for security.
5. Click the green **Add people** button.
6. In the search box, type your teammate's **GitHub username** or **email address**.
7. Select their name and click **Add [username] to this repository**.
8. **Teammate Acceptance**: Your teammate will receive an invitation email or a notification on GitHub. They must accept this invitation to begin pushing code or collaborating!
