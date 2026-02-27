# Announcement API

A fast, TypeScript-based REST API for managing announcements, built with Express, Prisma, and PostgreSQL.

## Features
- **Prisma 7 Integration**: Type-safe database queries with PostgreSQL.
- **Zod Validation**: Robust request body validation.
- **SWC Transpilation**: Extremely fast development and build times.
- **Auto-formatted Dates**: Dates are returned in `MM/DD/YYYY HH:mm` format.

## Get Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL database
- `pnpm` (recommended)

### 2. Installation
```bash
pnpm install
```

### 3. Database Setup
1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
2. Update `DATABASE_URL` in `.env` with your PostgreSQL connection string.
3. Generate Prisma Client and run migrations:
   ```bash
   pnpm dlx prisma generate
   ```

### 4. Running the App
```bash
# Development mode
pnpm dev

# Build for production
pnpm build
```

## API Documentation

### Base URL
`http://localhost:8000`

### 1. List All Announcements
**Endpoint**: `GET /announcements`

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "title": "Community Meeting",
    "content": "Join us this Friday for a city hall meeting.",
    "publicationDate": "2026-02-26T14:30:00.000Z",
    "lastUpdate": "2026-02-26T14:30:00.000Z",
    "categories": [
      { "id": 1, "name": "CITY", "displayName": "City" },
      { "id": 2, "name": "COMMUNITY_EVENTS", "displayName": "Community Events" }
    ]
  }
]
```

### 2. Get Single Announcement
**Endpoint**: `GET /announcements/:id`

**Response**: `200 OK` (or `404 Not Found`)

### 3. Create Announcement
**Endpoint**: `POST /announcements`

**Request Body**:
```json
{
  "title": "New Park Opening",
  "content": "A new park is opening in the city center!",
  "categories": [1, 3]
}
```

**Response**: `201 Created`

### 3. Edit Announcement
**Endpoint**: `PATCH /announcements/:id`

**Request Body** (all fields optional):
```json
{
  "title": "Updated Title",
  "categories": [2]
}
```

**Response**: `200 OK`

### 4. Categories Management
- `GET /categories`: List all categories.
- `POST /categories`: Create a new category.
  - Body: `{ "name": "CITY", "displayName": "City" }`

## Mock Data Examples

### 1. Initial Categories
Post these individually to `POST /categories`:
```json
[
  { "name": "CITY", "displayName": "City" },
  { "name": "COMMUNITY_EVENTS", "displayName": "Community Events" },
  { "name": "CRIME_SAFETY", "displayName": "Crime & Safety" },
  { "name": "CULTURE", "displayName": "Culture" },
  { "name": "DISCOUNTS_BENEFITS", "displayName": "Discounts & Benefits" },
  { "name": "EMERGENCIES", "displayName": "Emergencies" },
  { "name": "FOR_SENIORS", "displayName": "For Seniors" },
  { "name": "HEALTH", "displayName": "Health" },
  { "name": "KIDS_FAMILY", "displayName": "Kids & Family" }
]
```

### 2. Sample Announcements
Post to `POST /announcements`:

**Marathon Event**
```json
{
  "title": "Urban Marathon 2026",
  "content": "Join the annual city marathon starting from the main square. Registration is now open!",
  "categories": [1, 2],
  "publicationDate": "2026-02-01T08:00:00Z"
}
```

**Senior Health**
```json
{
  "title": "Free Health Checkups",
  "content": "Local clinics are offering free health screenings for seniors this weekend.",
  "categories": [8, 7],
  "publicationDate": "2026-02-10T10:30:00Z"
}
```

## Project Structure
- `src/server.ts`: API routes and server configuration.
- `src/lib/prisma.ts`: Prisma Client singleton with PostgreSQL adapter.
- `prisma/schema.prisma`: Database schema and Category enums.

```bash
pnpm run dev
```

or run tests

```bash
pnpm run test
```
