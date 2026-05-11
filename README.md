# EventRepo - Event Image Management System

A full-stack application for managing and uploading event images. Built with a Fastify backend and a React (Vite) frontend.

## Project Structure

- `backend/`: Fastify server handling image uploads and metadata storage.
- `frontend/`: React application providing a user interface for image uploads and viewing.

## Features

- **Image Upload**: Supports JPEG, JPG, and PNG formats.
- **Client-side Compression**: Frontend compresses images before upload for better performance.
- **Real-time Gallery**: Displays uploaded images with a responsive layout.
- **Rate Limiting**: Backend includes rate limiting to prevent abuse.
- **CORS Enabled**: Configured for cross-origin requests.

## Tech Stack

### Backend
- **Fastify**: High-performance Node.js framework.
- **@fastify/multipart**: File upload handling.
- **@fastify/cors**: CORS configuration.
- **@fastify/rate-limit**: API protection.
- **Local Storage**: Images saved to `uploads/` and metadata to `db.json`.

### Frontend
- **React 19**: Modern UI library.
- **Vite**: Fast build tool and dev server.
- **Tailwind CSS 4**: Modern utility-first styling.
- **Axios**: HTTP client for API requests.
- **Lucide React**: Icon library.
- **Browser Image Compression**: Client-side image processing.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/robinsihag1997/EventRepo.git
   cd EventRepo
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the Backend server:
   ```bash
   cd backend
   node server.js
   ```
   The server will run at `http://localhost:3000`.

2. Start the Frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173` (or the port shown in your terminal).

## License
ISC
