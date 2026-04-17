# Landchecker Project Creation Guide (Step-by-Step)

This document explains exactly how the Landchecker coding challenge project was created and wired end-to-end.

## 1) Prerequisites Installed

### macOS tooling

```bash
brew install ruby@3.3 postgresql@16
brew services start postgresql@16
```

### Shell PATH update for Ruby 3.3

```bash
echo 'export PATH="/opt/homebrew/opt/ruby@3.3/bin:/opt/homebrew/lib/ruby/gems/3.3.0/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Verify versions

```bash
ruby -v
node -v
npm -v
```

Target runtime used:
- Ruby 3.3.x
- Rails 7.1.x
- Node 20+

---

## 2) Backend Creation (Rails API)

Backend location:
`Folder/Landchecker-Coding-Challenge-backend`

### 2.1 Generate Rails API skeleton

```bash
rails new Landchecker-Coding-Challenge-backend --api -d postgresql
cd Landchecker-Coding-Challenge-backend
```

### 2.2 Add core gems

Added gems for this challenge:
- `pg`
- `bcrypt`
- `jwt`
- `rack-cors`
- `redis`
- `rack-attack`
- `rspec-rails`
- `factory_bot_rails`
- `faker`
- `bootsnap`

Then install:

```bash
bundle install
```

### 2.3 API routes

Implemented versioned REST API under `/api/v1`:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/properties`
- `GET /api/v1/properties/:id`
- `GET /api/v1/watchlist`
- `POST /api/v1/watchlist/:property_id`
- `DELETE /api/v1/watchlist/:property_id`

Also mounted ActionCable at `/cable`.

### 2.4 Database schema and migrations

Created tables:
- `users` (`email`, `password_digest`)
- `properties` (`title`, `address`, `property_type`, `bedrooms`, `bathrooms`, `price_cents`, `status`, `listed_at`)
- `watchlist_items` (`user_id`, `property_id`)

Indexes added:
- `users.email` unique
- `properties.property_type`
- `properties.bedrooms`
- `properties.price_cents`
- `properties.listed_at`
- composite search index on `properties(property_type, bedrooms, price_cents)`
- unique `watchlist_items(user_id, property_id)`

### 2.5 Models and relationships

- `User` has many `watchlist_items` and `watched_properties`
- `Property` has many `watchlist_items` and `watchers`
- `WatchlistItem` joins user/property and enforces uniqueness

### 2.6 Authentication

Implemented JWT auth:
- `JsonWebToken` service for encode/decode
- `Authenticatable` concern to validate bearer token
- `AuthController` for register/login

### 2.7 Search/filter/pagination

`PropertiesController#index` supports:
- `min_price`
- `max_price`
- `bedrooms`
- `property_type`
- `page`
- `per_page`

Added short-lived cache for index responses (`Rails.cache`) to improve repeated query performance.

### 2.8 Watchlist + real-time updates

- `WatchlistController` handles add/remove/list
- `WatchlistChannel` streams updates for authenticated user
- `Property` broadcasts to watcher streams when `price_cents` changes

### 2.9 Middleware and reliability

- `rack-cors` configured for frontend origin
- `rack-attack` throttle rules for API and login endpoint
- global error handling in `ApplicationController`

### 2.10 Seed data

Created seed script to add:
- demo user (`demo@landchecker.com` / `password123`)
- sample properties dataset

### 2.11 Backend tests

Configured RSpec and added critical path request tests:
- auth flow
- property filtering
- watchlist add/remove

Run backend tests:

```bash
bundle exec rspec
```

---

## 3) Frontend Creation (React + Vite + TypeScript)

Frontend location:
`Folder/Landchecker-Coding-Challenge-front-end`

### 3.1 Create app and install deps

Initialized React + TS app and installed:
- `react`, `react-dom`
- `vite`, `typescript`
- `@rails/actioncable`
- testing stack: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`

```bash
npm install
```

### 3.2 Frontend architecture

Folders organized by concern:
- `src/api` (HTTP clients)
- `src/components` (UI blocks)
- `src/context` (Auth + Watchlist state)
- `src/hooks` (infinite fetch behavior)
- `src/pages` (screen-level composition)
- `src/__tests__` (component tests)

### 3.3 Auth UX

Created `AuthForm` for login/register.
Auth state is handled by `AuthContext` with localStorage token persistence.

### 3.4 Property search dashboard

Created `PropertySearchPage` with:
- filter controls (price min/max, bedrooms, type)
- infinite scroll loading
- loading/error states

### 3.5 Favorites/watchlist UX

- `WatchlistContext` stores favorite IDs and toggle behavior
- optimistic toggle plus backend reconciliation fetch
- logout/login state reset and refresh-safe sync
- dashboard sections: **Favorites First** and **Other Listings**

### 3.6 Real-time updates (WebSocket)

Frontend ActionCable subscription:
- connects via `VITE_CABLE_URL?token=<jwt>`
- listens for `property_updated` events
- updates displayed price/status for watched items

### 3.7 Performance choices

- `PropertyCard` wrapped in `React.memo`
- list transforms in `useMemo`
- paginated/infinite fetch in dedicated hook
- request de-dupe guard to avoid stale async writebacks

### 3.8 Frontend tests and build

Added tests for:
- filter apply behavior
- property card watch toggle callback

Run:

```bash
npm test
npm run build
```

---

## 4) Daily Run Commands

### Backend

```bash
cd "Folder/Landchecker-Coding-Challenge-backend"
./bin/run
```

Optional seed during run:

```bash
./bin/run --seed
```

### Frontend

```bash
cd "Folder/Landchecker-Coding-Challenge-front-end"
npm run dev
```

---

## 5) Environment Variables

### Backend
- `JWT_SECRET`
- `FRONTEND_ORIGIN` (default `http://localhost:5173`)
- `REDIS_URL` (default `redis://localhost:6379/1`)

### Frontend
- `VITE_API_BASE_URL` (default `http://localhost:3000/api/v1`)
- `VITE_CABLE_URL` (default `ws://localhost:3000/cable`)

---

## 6) Deployment Path Used

Recommended deployment flow:
- Backend as Render Web Service
- Render Postgres for DB
- Render Redis-compatible Key Value for cable/cache
- Frontend as Render Static Site

---

## 7) Known Enhancements (Optional)

Nice-to-have future additions:
- location-based search
- saved searches
- stronger E2E tests
- full docker-compose for local one-command fullstack boot
