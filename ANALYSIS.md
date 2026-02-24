# Repository Analysis: Uaccess Management System

## Project Overview
This repository contains the source code for the **Uaccess Management System**, a Progressive Web Application (PWA) designed for managing access control, memberships, bookings, and resources for a shared space (e.g., coworking hub, maker space). It features a modern React frontend and a robust Express.js backend.

## Architecture
The project follows a **Monorepo-style structure**:
- **Frontend (`/` & `src/`)**: A Single Page Application (SPA) built with React and Vite.
- **Backend (`/backend`)**: A RESTful API built with Node.js and Express.

## Technology Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Routing**: React Router DOM 7
- **HTTP Client**: Axios (with retry logic)
- **Real-time**: Socket.io Client
- **Icons**: Lucide React
- **PWA Support**: `vite-plugin-pwa`, `workbox-window`
- **QR Code**: `html5-qrcode`, `qrcode.react`

### Backend
- **Framework**: Express 5 (beta)
- **Database ORM**: Sequelize 6
- **Database**: PostgreSQL (`pg`)
- **Authentication**: JSON Web Tokens (JWT), Bcrypt
- **Real-time**: Socket.io
- **Security**: Helmet, CORS, Express Rate Limit
- **Notifications**: `web-push`
- **Utility**: `date-fns`, `dotenv`

## Key Features

1.  **User Management & Authentication**
    -   Role-Based Access Control (RBAC): Roles include Admin, Hub Manager, Member, Security, Instructor.
    -   Secure Login with JWT and Refresh Tokens.
    -   Onboarding flow for new users.

2.  **Access Control**
    -   **QR Code System**: Users generate dynamic QR codes for access.
    -   **Scanner Interface**: Hub Managers can scan QR codes to verify access.
    -   **Access Rules**: Configurable rules for entry.
    -   **Activity Logs**: Detailed logs of entry/exit and denied attempts.
    -   **Device Management**: Administration of physical access devices.

3.  **Resource Management**
    -   **Spaces**: Booking and management of rooms/spaces (e.g., Coworking, Meeting Rooms).
    -   **Equipment**: Inventory and booking of equipment (e.g., 3D Printers, Laser Cutters).
    -   **Categories & Amenities**: Classification and details for resources.

4.  **Membership System**
    -   **Tiers**: Configurable membership levels (Basic, Pro, Enterprise, VIP).
    -   **Status Tracking**: Active, Expired, Suspended states.
    -   **Quotas**: Limits on booking hours or room usage based on tier.

5.  **Dashboard & Analytics**
    -   **User Dashboard**: Overview of bookings, notifications, and access status.
    -   **Admin Dashboard**: comprehensive view of members, logs, and system health.
    -   **Analytics**: Charts and stats for usage trends.

6.  **Notifications**
    -   Real-time in-app notifications.
    -   Web Push notifications support.

## Database & API
-   **Database**: The system relies on a relational database (PostgreSQL recommended via config) managed by Sequelize.
-   **API Structure**: RESTful endpoints organized under `/api/v1/`.
-   **Mock Data**: The frontend includes extensive mock data generators (`src/lib/mockData.js`) for development and testing without a backend or populated database.

## Infrastructure & Tooling
-   **Configuration**: Environment-based configuration (using `.env` and `config/config.js`).
-   **Scripts**:
    -   Frontend: `dev`, `build`, `lint`.
    -   Backend: `start`, `dev` (nodemon), `migrate`, `seed`.
    -   **Utility Scripts**: Numerous scripts in `backend/` and `backend/scripts/` for tasks like database checks, data fixes, and connection testing.
-   **Deployment Readiness**: Includes `vercel.json` configuration, suggesting deployment on Vercel is a primary target.

## Observations
-   **Testing**: The backend currently lacks a test suite (`npm test` exits with error).
-   **Mock Data Dependency**: The frontend relies heavily on mock data in some areas, which might need careful integration verification with the real backend.
-   **Rate Limiting**: Custom configuration exists to handle proxy trust issues, specifically for Vercel deployment.
