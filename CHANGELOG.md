# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-24

### Added

- **Core Application Structure**: Established a monorepo structure with a React frontend (`src/`) and an Express backend (`backend/`).

- **Frontend Features**:
  - **State Management**: Implemented Zustand stores for centralized state handling:
    - Authentication (`authStore`)
    - Bookings (`bookingStore`)
    - Spaces (`spaceStore`)
    - Memberships (`membershipStore`)
    - Analytics (`analyticsStore`)
    - Equipment (`equipmentStore`)
    - Logs (`logsStore`)
    - Notifications (`notificationStore`)
    - Onboarding (`onboardingStore`)
    - Security (`securityStore`)
    - Theme (`themeStore`)

- **Backend Features**:
  - **API Controllers**: Created comprehensive controllers for core functionality:
    - **Access Control**: `accessController`, `authController`, `userController`.
    - **Resource Management**: `bookingController`, `spaceController`, `spaceCategoryController`, `equipmentController`, `equipmentCategoryController`, `amenityController`.
    - **Memberships**: `membershipController`.
    - **Operations**: `scanController` (QR code scanning), `analyticsController`, `deviceController`.
    - **Notifications**: `notificationController`, `pushController`.
    - **Onboarding**: `onboardingController`.
  - **Database**: Set up Sequelize ORM with PostgreSQL, including initial models and migrations.
  - **Middleware**: Implemented authentication and error handling middleware.

- **Infrastructure**:
  - Configured Vite for frontend development and build process.
  - Set up Tailwind CSS for styling.
  - Added support for PWA with `vite-plugin-pwa`.
