# PurePixel Frontend

The React web client for **PurePixel**, a platform where photographers share, sell and get booked for photos. It was built as an FPT University capstone project.

[![Netlify Status](https://api.netlify.com/api/v1/badges/e3d07761-b69b-4b20-9feb-a1452076d8f0/deploy-status)](https://app.netlify.com/sites/preeminent-dieffenbachia-8fcfe1/deploys)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Ant Design](https://img.shields.io/badge/Ant_Design-5-0170FE?logo=antdesign&logoColor=white)

## Overview

PurePixel connects photographers with people who love photography. Photographers upload and showcase their work, sell digital copies and offer photoshoot packages. Customers browse feeds, explore photos on a map, buy photos and book photoshoots. This single-page app talks to the [PurePixel backend](https://github.com/khangzxrr/pure-pixel-backend) through REST and Socket.IO, and signs users in with Keycloak.

## Features

- **Keycloak authentication** with silent SSO and role-based routes for guest, customer, photographer, manager and admin.
- **Discover photos**: home feed, explore, hot, inspiration, following, a newsfeed, and photo detail pages with BlurHash placeholders and comments.
- **Photo map** with Mapbox, showing geotagged photos and clustering them by zoom level.
- **Uploads**: batch upload that reads EXIF metadata in the browser (`exifr`), sets the location with Mapbox search, and shows live processing progress over Socket.IO.
- **Marketplace**: sell photos with price tags per size, buy photos, view purchase history, and see seller shop profiles.
- **Photoshoot packages and booking**: photographers manage packages and booking requests, and customers create and track bookings.
- **Wallet**: deposits, withdrawals and transaction history. Bank lists come from VietQR.
- **Upgrade to photographer**: pick a membership package, then pay and have the access token refreshed automatically.
- **Messaging** with Stream Chat, plus **notifications** through Socket.IO and OneSignal web push.
- **Cameras**: pages that rank camera brands and models.
- **Blog** and policy pages.
- **Manager and admin dashboards** for photo moderation, reports, blogs, cameras, service packages, upgrade requests, transactions, withdrawal processing, account management, and statistics charts (Chart.js / ApexCharts).
- The UI is in Vietnamese, with Ant Design's `vi_VN` locale.

## Tech stack

| Area | Technologies |
| --- | --- |
| Core | React 18, Vite 5, React Router 6 |
| UI | Tailwind CSS, Ant Design, Headless UI, Framer Motion, react-icons / lucide-react |
| State and data | Zustand, TanStack Query, Axios |
| Forms | React Hook Form, Yup |
| Auth | Keycloak (`keycloak-js`, `@react-keycloak/web`) |
| Maps and media | Mapbox GL (`react-map-gl`, `@mapbox/search-js-react`), `exifr`, BlurHash |
| Real-time | Socket.IO client, Stream Chat React, OneSignal |
| Charts and editors | Chart.js, ApexCharts, Draft.js / React Quill |

## Project structure

```
src/
├── apis/          # Axios API clients per domain (photo, booking, wallet, ...)
├── authorize/     # route protection helpers
├── components/    # shared and feature components
├── configs/       # Axios HTTP instance
├── hooks/         # reusable hooks (role permissions, table/modal state, ...)
├── layouts/       # page layouts (main, dashboard, admin, profile, ...)
├── pages/         # route pages (HomePage, PhotoMap, BookingPage, Manager, Admin, ...)
├── routers/       # AppRouter + role-protected routes
├── services/      # Keycloak, OneSignal, EXIF photo helpers
├── states/        # Zustand stores (upload, socket, notifications, filters, ...)
├── yup/           # validation schemas
├── App.jsx        # providers: React Query, Keycloak, Ant Design, notifications, chat
└── main.jsx
```

## Getting started

### Prerequisites

- Node.js 18+
- Yarn 1.x
- A running [PurePixel backend](https://github.com/khangzxrr/pure-pixel-backend) and Keycloak realm

### Installation

```bash
yarn install   # install all required packages
cp example.env .env
yarn dev       # start the dev server at http://localhost:3000
```

### Environment variables

| Variable | Description |
| --- | --- |
| `VITE_OIDC_AUTHORITY` | Authentik OIDC issuer/authority URL (e.g. `https://auth.example.com/application/o/purepixel/`) |
| `VITE_OIDC_CLIENT_ID` | Authentik OIDC client ID |
| `VITE_AUTH_REGISTER_URL` | Authentik enrollment flow URL used for user registration |
| `VITE_AXIOS_BASE_URL` | Backend REST base URL |
| `VITE_WEBSOCKET_UPLOAD_PHOTO` | Backend Socket.IO gateway for photo-processing events |
| `VITE_ONE_SIGNAL_APP_ID` | OneSignal app ID for web push (only used outside localhost) |
| `VITE_STREAM_API_KEY` | Stream Chat API key |
| `VITE_MAPBOX_TOKEN` | Mapbox access token |

### Scripts

```bash
yarn dev       # development server
yarn build     # production build
yarn preview   # preview the production build
yarn lint      # ESLint
```

## Deployment

- `netlify.toml` / `public/_redirects` send every route to `index.html` so SPA routing works.
- `.github/workflows/node.js.yml`: every push to `main` connects to the server over SSH, pulls the code and runs `yarn build`.

## Team

- [@ChiBaoo](https://github.com/ChiBaoo)
- [@TrungNguyenHRZ](https://github.com/TrungNguyenHRZ)
- [@khangzxrr](https://github.com/khangzxrr) (Vo Ngoc Khang)
- [@hohongminh](https://github.com/hohongminh)
