# Supermarket Admin Frontend

React + Vite frontend for the Supermarket Admin Panel.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` if your backend is running on a different URL:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Features

- ✅ Role-based authentication
- ✅ Dashboard with KPIs
- ✅ Product management
- ✅ Inventory management
- ✅ Order management
- ✅ Employee management
- ✅ Customer management
- ✅ Analytics & reports

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Zustand (State Management)
- React Router
- React Hook Form + Zod
- Recharts (Charts)
- Axios (HTTP Client)

## Project Structure

```
src/
├── components/
│   ├── ui/          # Reusable UI components
│   ├── layout/      # Layout components
│   └── auth/        # Authentication components
├── pages/           # Page components
├── store/           # Zustand stores
├── utils/           # Utility functions
└── App.jsx          # Main app component
```

