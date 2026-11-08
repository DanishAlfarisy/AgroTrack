# AgroTrack

AgroTrack is a Progressive Web App (PWA) for recording and managing plant cultivation data. Data is stored locally first using IndexedDB and synchronized with Supabase whenever an internet connection is available.

## Live Demo

**Application URL:** https://agrotrack-orcin.vercel.app/

## Features

- Dynamic dashboard displaying total plants, growth stage summaries, recently added plants, and the latest plant records.
- Full CRUD functionality for plant management, including validation, deletion confirmation, and notifications.
- Search by plant name, scientific name, variety, and location, with category and growth status filters.
- Plant detail and student profile pages.
- Persistent plant cache and mutation queue using IndexedDB.
- Create, update, and delete operations remain available while offline.
- Automatic synchronization when the application is opened and when the browser reconnects to the internet. The application does not use or claim to support the Background Sync API.
- Installable PWA with a web app manifest, service worker, Workbox precaching, and offline SPA navigation.
- Responsive desktop layout with a sidebar and mobile bottom navigation.

## Technology Stack

- React 19, JavaScript/JSX, Vite 8
- React Router DOM 7
- Supabase PostgreSQL via `@supabase/supabase-js`
- IndexedDB with the `idb` wrapper
- `vite-plugin-pwa` and Workbox
- Lucide React, plain CSS, ESLint

## Project Structure

```text
src/
├── components/       # Layout, plant components, toast, and loading
├── constants/        # Plant categories and growth status values
├── contexts/         # Plant data and toast state
├── db/               # IndexedDB and synchronization queue
├── hooks/            # Connection status and PWA installation
├── lib/              # Supabase client
├── pages/            # Dashboard, plant list, detail, and profile
├── services/         # Supabase queries and synchronization
└── utils/            # Validation, normalization, and data formatting
public/
├── icons/            # PWA icons
├── images/           # Dashboard illustrations
└── offline.html      # Static offline fallback
supabase/schema.sql   # Database schema, triggers, indexes, and RLS policies
```

## Getting Started

**Prerequisites:** Node.js `22.12.0` or later and npm.

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the URL provided by Vite, usually:

`http://localhost:5173`

The application can run locally without Supabase configuration using IndexedDB for local CRUD operations. Cloud synchronization requires valid Supabase credentials configured in the local environment.

## Offline Synchronization

- Previously synchronized plant records are stored in IndexedDB and remain readable while offline.
- Create, update, and delete operations immediately update the local interface and cache, while also being recorded in a persistent synchronization queue.
- UUIDs are generated on the client. Create operations use Supabase `upsert` with the `id` column as the conflict target, ensuring retries reuse the same ID and do not create duplicate records.
- The queue consolidates repeated updates. A create followed by an update is stored as a single create with the latest payload, while a create followed by a delete is canceled before being sent to Supabase.
- When the connection is restored, queued operations are processed sequentially. An item is removed from the queue only after the corresponding Supabase mutation succeeds. If a network error occurs, the item remains stored for a future retry.
- Synchronization runs when the application is active or reopened and when the browser receives an `online` event. If the application is closed, pending operations remain persistent and resume when the application is opened again.
- Cross-device conflict resolution based on versions or timestamps is not currently implemented. If another device modifies the same record, the latest local mutation submitted to Supabase takes precedence.

## Testing Offline Functionality and PWA Installation

The production service worker should be tested using a production build:

```bash
npm run build
npm run preview
```

Follow these steps:

1. Open the preview URL while online and wait for the service worker to become active.
2. Add or synchronize plant records so that the local cache contains data.
3. Open **DevTools > Application > Service Workers** and verify that the AgroTrack service worker is registered. In the Network tab, switch the connection mode to **Offline**.
4. Reload `/`, `/plants`, and `/plants/:id`. The application shell and locally cached data should remain accessible.
5. While offline, create, edit, or delete plant records. The connection status and pending synchronization count should be visible in the header.
6. Restore the internet connection. The queue will be synchronized automatically when the `online` event is processed. The pending indicator should disappear after successful synchronization.
7. The install button appears only when the browser supports and triggers `beforeinstallprompt`. Safari on iOS generally provides installation through the Share menu instead.

Synchronization does not continue in the background after the browser closes the application. Offline changes remain persistent and are submitted when the application is reopened or reconnects while active.

## Linting and Production Build

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The production output is generated in the `dist/` directory. `vite-plugin-pwa` generates the web app manifest and service worker using Workbox. SPA navigation is handled through the Vite/Workbox configuration and `vercel.json`.
