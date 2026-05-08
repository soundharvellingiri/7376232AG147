# Notification System Design

This project is a small React + TypeScript frontend that shows notifications from the Affordmed evaluation service.

## Architecture Overview

- `api/` contains axios request helpers for auth and notifications.
- `services/` contains small flow helpers like auth initialization.
- `middleware/` contains the reusable logger.
- `utils/` contains shared helpers like token storage, env validation, and sorting.
- `pages/` contains the main Home screen.

The structure stays simple on purpose so it is easy to review and explain.

## Authentication Flow

The app reuses a stored token when available. If no token exists, it calls the auth API using `clientID`, `clientSecret`, and the rest of the env configuration. The token is stored in `localStorage` and reused for protected requests.

Registration is kept as a separate manual utility and is not called automatically.

## Polling Flow

Notifications are fetched on page load and then every 15 seconds with `useEffect` and `setInterval`. The interval is cleaned up on unmount and when the filter values change.

## Logging Middleware

The logger sends API logs with `stack`, `level`, `package`, and `message`. It reads the bearer token from storage automatically and returns `false` if logging fails, so the UI does not crash.

## Notification Sorting

Notifications are sorted before rendering in this order:

Placement > Result > Event

The sorting logic is kept in one utility file so the Home page stays easy to follow.

## Filtering Support

The Home screen supports simple controls for:

- notification type
- limit
- page

These values are passed as axios query params to the notification API.

## Scalability Considerations

- The current structure can grow without changing the basic flow.
- New pages can be added under `pages/`.
- New API calls can stay isolated in `api/`.
- Shared helpers stay in `utils/` and `middleware/`.

## Mobile Responsiveness

The UI uses Material UI spacing and responsive layout props so the notification cards and filter controls work on smaller screens without redesigning the page.
