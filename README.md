# CareOps Platform

A unified operations platform for service-based businesses that replaces disconnected tools with one integrated system.

## Tech Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Socket.io
- **Database**: Supabase (PostgreSQL) + Prisma ORM
- **Integrations**: Resend (Email), Twilio (SMS)

## Project Structure

```
careops/
├── frontend/          # React application
└── backend/           # Express API server
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier) - [Sign up here](https://supabase.com)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. **Set up Supabase** - Follow the [Supabase Setup Guide](SUPABASE_SETUP.md) to:
   - Create a Supabase project
   - Get your database connection string
   - Update `.env` with your Supabase credentials

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Run database migrations (when ready):
   ```bash
   npx prisma migrate dev
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

Frontend will run on `http://localhost:5173`

## Features

- 🏢 Multi-tenant workspace management
- 📅 Booking and scheduling system
- 💬 Unified inbox (Email + SMS)
- 📝 Dynamic form builder and submissions
- 📦 Inventory tracking with alerts
- ⚡ Event-based automation engine
- 🔔 Real-time notifications via WebSockets
- 👥 Role-based access control (Owner/Staff)

## Development

- Backend runs with nodemon for hot reload
- Frontend uses Vite HMR for instant updates
- Database schema changes: Run `npx prisma migrate dev`

## License

MIT
