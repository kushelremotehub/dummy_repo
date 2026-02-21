# Curriforge

An AI-powered application to generate structured, pedagogically sound curricula for any subject, audience, and duration.

## Features
- **AI-Powered Generation**: Uses Gemini 3.1 Pro to craft detailed learning paths.
- **Structured Content**: Includes course overview, learning objectives, module breakdowns, and resources.
- **History Management**: Save and manage your generated curricula in a local SQLite database.
- **Modern UI**: Built with React, Tailwind CSS, and Framer Motion for a premium experience.

## Setup Instructions

1. **Environment Variables**:
   - Ensure `GEMINI_API_KEY` is set in your environment (AI Studio handles this automatically).
   - The app uses `better-sqlite3` for local storage; the database file `curricula.db` will be created automatically on the first run.

2. **Installation**:
   ```bash
   npm install
   ```

3. **Development**:
   ```bash
   npm run dev
   ```
   The application will start on port 3000.

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

## Folder Structure
- `/src`: Frontend React code.
  - `App.tsx`: Main application logic and UI.
  - `index.css`: Global styles and Tailwind configuration.
- `server.ts`: Express backend with SQLite integration.
- `curricula.db`: SQLite database (generated at runtime).
