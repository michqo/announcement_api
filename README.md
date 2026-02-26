# Express app

**Express TypeScript app template that transpiles really quickly thanks to [swc](https://swc.rs)**

To create a new project based on this template using [degit](https://github.com/Rich-Harris/degit):

```bash
pnpx degit MichalUSER/typescript-swc-express express-app
cd express-app
```

## Database Setup with Prisma (v7+)

1. Set your `DATABASE_URL` in `.env`.
2. Generate the Prisma Client:
   ```bash
   npx prisma generate
   ```
3. Run migrations to create the database schema:
   ```bash
   npx prisma migrate dev
   ```

## Endpoints

- `GET /announcements`: List all announcements.
- `POST /announcements`: Create a new announcement.
  - Body: `{ "title": "...", "content": "..." }`

```bash
pnpm run dev
```

or run tests

```bash
pnpm run test
```

_Note that we use **[pnpm](https://pnpm.io) - fast and efficient package manager**_
