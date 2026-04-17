# Landchecker Project Architecture and Implementation

This document explains how the application is designed, what was implemented, and how the pieces work together.

## 1) High-Level Architecture

Landchecker is a two-application fullstack system:

- Backend: Ruby on Rails API + PostgreSQL + ActionCable
- Frontend: React + Vite + TypeScript

Communication model:

- HTTP REST API for auth, property search, and watchlist actions
- WebSocket (ActionCable) for real-time watchlist property updates

Data model summary:

- `User` has many `WatchlistItem`
- `Property` has many `WatchlistItem`
- `WatchlistItem` belongs to `User` and `Property`

---

## 2) Backend Architecture (Rails)

## 2.1 API Layer

Namespaced routes under `/api/v1` keep the API versioned and maintainable.

Main resource groups:

- Auth
  - `POST /auth/register`
  - `POST /auth/login`
- Properties
  - `GET /properties`
  - `GET /properties/:id`
- Watchlist
  - `GET /watchlist`
  - `POST /watchlist/:property_id`
  - `DELETE /watchlist/:property_id`

Why this design:

- Clear REST boundaries
- Easy extension for future API versions
- Frontend can consume predictable JSON contracts

## 2.2 Authentication and Authorization

Implemented JWT-based auth.

Components:

- `JsonWebToken` service encodes/decodes JWT payloads
- `Authenticatable` controller concern validates bearer token and sets `current_user`
- Protected endpoints require valid token

Result:

- Stateless API auth suitable for SPA frontend

## 2.3 Domain Models

### User

- Secure password storage via `has_secure_password`
- Unique email validation
- Watchlist associations

### Property

- Fields: title, address, property_type, bedrooms, bathrooms, price_cents, status, listed_at
- Filter scopes for search criteria
- Broadcast callback when `price_cents` changes

### WatchlistItem

- Join model between users and properties
- Unique index and validation on `[user_id, property_id]`

## 2.4 Search and Pagination

`PropertiesController#index` supports:

- Filter by min/max price
- Filter by bedrooms
- Filter by property type
- Pagination via `page` and `per_page`

Returned payload includes:

- `data` list
- `meta` object (`page`, `per_page`, `total`, `total_pages`)

## 2.5 Caching Strategy

Short-lived cache is applied to the property index query result per filter/page combination.

Goal:

- Reduce repeated DB/query work for identical search requests

## 2.6 Real-Time Updates via ActionCable

### Connection

ActionCable connection authenticates using JWT from query param.

### Channel

`WatchlistChannel` streams updates scoped to the authenticated user.

### Broadcast Trigger

When a property price changes, backend broadcasts an update to all watchers of that property.

Payload includes:

- `property_id`
- `price_cents`
- `status`
- `updated_at`

## 2.7 Defensive and Operational Concerns

- CORS configured for frontend origin
- Rate limiting via `rack-attack`
- Error handling for not-found and bad-request scenarios

## 2.8 Testing (Backend)

Critical request specs cover:

- Register/login flow
- Property filtering behavior
- Watchlist add/remove behavior

---

## 3) Frontend Architecture (React)

## 3.1 Structure

Frontend is organized by responsibility:

- `api/`: REST clients
- `components/`: reusable UI pieces
- `context/`: global app state (auth + watchlist)
- `hooks/`: feature hooks (infinite loading)
- `pages/`: page-level composition

## 3.2 State Management Strategy

Context API is used for global concerns:

- `AuthContext`
  - stores token/user
  - handles login/register/logout
  - persists session via localStorage

- `WatchlistContext`
  - tracks favorite property IDs
  - handles add/remove toggle
  - subscribes to websocket updates
  - reconciles with backend to avoid stale UI

Why this design:

- Enough for challenge scope without Redux overhead
- Keeps data flow explicit and testable

## 3.3 Search Experience

`PropertySearchPage` composes:

- Filters UI
- Infinite scrolling result list
- Loading and error feedback
- Favorites-first dashboard sections

Sections shown:

- `Favorites First`
- `Other Listings`

This improves user focus and keeps important listings visible.

## 3.4 Infinite Scroll Implementation

Custom hook `useInfiniteProperties`:

- fetches paged API results
- appends next page when sentinel enters viewport
- tracks `hasMore`, `loading`, and `error`
- uses request guard to avoid stale async races

## 3.5 Real-Time Update Handling

Frontend subscribes to ActionCable channel and stores latest updates in memory map keyed by `property_id`.

UI behavior:

- If live update exists, card shows updated price/status immediately
- Works without manual page refresh

## 3.6 UI and Performance Choices

Implemented choices:

- `PropertyCard` wrapped in `React.memo`
- `useMemo` for derived property groupings (favorites vs others)
- Context values memoized to reduce unnecessary rerenders
- Dedicated loading and empty states for clarity

## 3.7 Testing (Frontend)

Component tests cover:

- Filter apply action and payload
- Property watch button callback behavior

Build validation also confirms TypeScript + Vite production output.

---

## 4) End-to-End Data Flow

## 4.1 Login

1. User submits credentials
2. Frontend calls `/api/v1/auth/login`
3. Backend returns JWT + user info
4. Frontend stores token and user in localStorage/context

## 4.2 Search and Scroll

1. Frontend requests `/api/v1/properties` with filters and page
2. Backend applies scopes + pagination and returns data/meta
3. Frontend renders cards and loads additional pages on scroll

## 4.3 Watchlist Toggle

1. User clicks save/remove
2. Frontend calls watchlist endpoint
3. UI updates immediately and then reconciles with backend watchlist response

## 4.4 Real-Time Price Change

1. Property price is updated in backend
2. Backend broadcasts to watchers via `WatchlistChannel`
3. Frontend receives event and updates relevant card state

---

## 5) What Was Implemented (Checklist Summary)

Implemented:

- REST API for auth, properties, watchlist
- JWT authentication
- PostgreSQL schema and indexes
- Search filters and pagination/infinite scroll
- Watchlist add/remove functionality
- ActionCable real-time watchlist updates
- Rate limiting
- Short TTL search caching
- RSpec backend tests
- RTL/Vitest frontend tests
- Improved login UI and favorites-first dashboard UX

Partially/Optional:

- Advanced search (location/saved searches) not implemented
- Full docker-compose orchestration not included

---

## 6) Deployment Model

Recommended deployment split:

- Backend as web service (Rails)
- Managed Postgres
- Managed Redis-compatible store
- Frontend static hosting

Environment variables wire frontend to backend API and websocket endpoint.
