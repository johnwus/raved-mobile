# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository overview

- `raved/` — Expo (React Native) app using Expo Router, TypeScript, and flat ESLint config.
- `backend/` — Node.js + Express + TypeScript API with Socket.io, PostgreSQL (Sequelize), MongoDB (Mongoose), Redis (Bull), and assorted integrations (OpenAI, Cloudinary, Paystack, Sendgrid, Twilio).

The two projects are independent Node packages; run commands from within their respective directories.

## Common commands

### raved (Expo app)

- Install deps
  - `cd raved && npm install`
- Start dev server (QR, simulator, or web)
  - `npm run start`
  - Platform shortcuts: `npm run android` | `npm run ios` | `npm run web`
- Lint
  - `npm run lint` (eslint-config-expo, flat config)
- Type check
  - `npx tsc --noEmit`

Notes
- The app uses Expo Router (file-based routing under `raved/app/`) with `typedRoutes` and React Compiler enabled in `app.json`.
- New Architecture is enabled (`newArchEnabled: true`).

### backend (Node/Express API)

- Install deps
  - `cd backend && npm install`
- Development (ts-node + nodemon)
  - `npm run dev`
- Build
  - `npm run build` (outputs to `backend/dist`)
- Run built server
  - `npm start`
- Database utilities
  - Init DB schema/data: `npm run init-db`
  - Seed mock data: `npm run seed-mock`
  - Check seed status: `npm run check-seed`

Notes
- The backend README mentions `npm test`, but no `test` script is defined in `backend/package.json`.

## Testing status

- No test runners or scripts are currently defined in either `raved/package.json` or `backend/package.json`. If tests are added later, document how to run a single test based on the chosen framework.

## High-level architecture

### Mobile app (raved/)

- Routing/navigation: Expo Router with `typedRoutes`; React Navigation (bottom tabs, drawer, native stack) for navigation primitives.
- State & persistence: Zustand for state management; MMKV for fast on-device key-value storage.
- Networking: Axios for HTTP; `socket.io-client` for realtime.
- UI/UX: Expo modules (camera, image, video, blur, linear gradient, haptics, splash), vector-icons/SVG, gesture-handler/reanimated, safe-area-context/screens.
- Internationalization: i18next + react-i18next; `expo-localization` for device locale.
- Build/runtime config: `app.json` configures platform settings, plugins, and experiments; Metro bundler via Expo.

### Backend API (backend/)

- Runtime: Node.js + Express with TypeScript.
- Realtime: Socket.io server for messaging/events.
- Datastores:
  - PostgreSQL via Sequelize for relational data (users, connections, subscriptions, events, analytics, etc.).
  - MongoDB via Mongoose for document/stream content (posts, comments, messages, stories, moderation queue, notifications).
- Queues & rate limiting: Bull (Redis) for jobs; rate-limiter-flexible for request limiting.
- Integrations: OpenAI for moderation, Cloudinary for media, Paystack for payments, Sendgrid for email, Twilio for SMS, Firebase Admin for push notifications.
- Security & ops: Helmet, compression, CORS; environment-driven config via `.env` (see `backend/README.md`).
- Tooling: `ts-node` for scripts, `nodemon` for development, `tsc` build to `dist/`.

### Frontend–Backend interaction

- The mobile app communicates with the API via Axios and subscribes to realtime updates via `socket.io-client`.
- Ensure the backend is running and reachable when exercising app features that depend on API or sockets.

## Linting & formatting

- raved: ESLint flat config (`raved/eslint.config.js`) based on `eslint-config-expo`; `dist/*` is ignored.
- backend: No ESLint config detected.

## Documentation references

- raved: See `raved/README.md` for basic Expo usage (install/start/reset-project).
- backend: See `backend/README.md` for features, endpoints, required environment variables, and workflows (e.g., moderation pipeline).
