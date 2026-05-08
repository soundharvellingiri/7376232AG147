# Affordmed Frontend Evaluation

This is a React + TypeScript + Vite frontend built for the Affordmed campus evaluation. The app focuses on the pieces the evaluation cares about most: authentication, protected API requests, notification polling, sorting, filtering, and logging.

## Project Overview

The app loads notifications from the Affordmed evaluation service, sorts them by priority, and refreshes the list every 15 seconds. It uses Material UI for a clean responsive layout and axios for all API requests.

The code is intentionally kept at a beginner-to-intermediate level so it is easy to review, maintain, and explain in an interview.

## Setup Instructions

### Prerequisites

- Node.js 18 or later
- npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

## Environment Variables

Create a `.env` file inside `notification_app_fe`:

```bash
VITE_BASE_URL=http://20.244.56.144/evaluation-service
VITE_EMAIL=
VITE_NAME=
VITE_ROLLNO=
VITE_MOBILE=
VITE_GITHUB_USERNAME=
VITE_ACCESS_CODE=
VITE_CLIENT_ID=
VITE_CLIENT_SECRET=
```

## Technologies Used

- React
- TypeScript
- Vite
- Material UI
- axios

## Folder Structure

```text
src/
├── api/
├── components/
├── middleware/
├── pages/
├── services/
├── styles/
├── types/
└── utils/
```

### Key Files

- `src/api/authApi.ts` - auth and registration requests
- `src/api/notificationApi.ts` - notification fetching with bearer token support
- `src/middleware/logger.ts` - reusable logging middleware
- `src/services/authInitializer.ts` - token initialization flow
- `src/utils/envConfig.ts` - simple env validation helper
- `src/utils/tokenStorage.ts` - localStorage token helper
- `src/utils/priorityUtils.ts` - notification priority sorter
- `src/components/NotificationCard.tsx` - responsive notification card
- `src/components/NotificationList.tsx` - simple notification list wrapper
- `src/pages/Home.tsx` - main page with auth, filters, polling, and rendering

## Authentication Flow

The app checks local storage first. If a token already exists, it reuses it. If not, it calls the auth API using the values from `.env`, stores the bearer token, and then continues with protected requests.

Registration is available as a separate utility for one-time manual setup only.

## Polling Explanation

Notifications are fetched on page load and then every 15 seconds with `useEffect` and `setInterval`. The interval is cleared on unmount and when the filter values change.

## Logging Middleware Usage

The logger sends API logs for auth success/failure, notification fetch success/failure, polling start/stop, and API errors. If logging fails, the app keeps working and only writes the issue to the console.

## Screenshots

Add screenshots after capturing the final UI.

### Home Page

![Home page screenshot](./screenshots/home-page.png)

### Filter Controls

![Filter controls screenshot](./screenshots/filter-controls.png)

### Notification List

![Notification list screenshot](./screenshots/notifications.png)

## Notes

- Filters support notification type, limit, and page.
- Sorting order is Placement > Result > Event.
- The UI is kept responsive with simple Material UI layout props.
