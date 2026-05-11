# AI Context: EventRepo Project

This document provides high-level architectural and technical context for AI assistants working on this codebase.

## System Architecture

EventRepo is a decoupled monolith (monorepo structure) with a simple backend and a modern frontend.

### 1. Backend (`/backend`)
- **Framework**: Fastify (Node.js).
- **Core Logic**: `server.js` handles routing, file uploads, and static file serving.
- **Data Persistence**: Uses a local JSON file (`db.json`) as a flat-file database. It checks for existence and initializes if missing.
- **File Storage**: Images are stored in the `/uploads` directory.
- **Key Plugins**:
  - `multipart`: Limits file size to 1MB.
  - `rate-limit`: 100 requests per minute.
  - `static`: Serves files from `/uploads`.
- **API Endpoints**:
  - `GET /`: Health check.
  - `POST /upload`: Uploads an image (multipart). Expects `name` and `file`.
  - `GET /images`: Returns the last 5000 image metadata objects with absolute URLs.

### 2. Frontend (`/frontend`)
- **Framework**: React 19 + Vite.
- **Styling**: Tailwind CSS 4.
- **Main Components**:
  - `src/UploadPage.jsx`: Contains the bulk of the logic for capturing/selecting images, compressing them via `browser-image-compression`, and uploading via `axios`.
- **State Management**: Standard React `useState` and `useEffect`.
- **Routing**: `react-router-dom` is installed but the main logic is currently in one primary view.

## Development Workflow
- **Backend Port**: 3000
- **Frontend Port**: 5173
- **Local Dev**: Run `node server.js` in backend and `npm run dev` in frontend.

## Common Tasks for AI
- **UI Enhancements**: Modifying `UploadPage.jsx` for better UX or aesthetic improvements.
- **Backend Scaling**: Moving from `db.json` to a proper database (e.g., PostgreSQL/MongoDB) if the project grows.
- **Authentication**: The current system has no authentication; adding JWT or session-based auth would be a common next step.
- **Deployment**: Configuring for production (e.g., environment variables for ports and URLs).

## Environment Constraints
- Keep images under 1MB (enforced by backend).
- Ensure CORS is configured if changing the frontend/backend hosting locations.
