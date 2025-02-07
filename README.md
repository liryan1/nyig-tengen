# NYIG Tengen

A web application for the Go community.

## Design

- All problems assume black to play. This can be randomized in the UI

## Technologies used

- NextJS
- Next-Auth (aka Auth.js)
- Prisma
- MongoDB
- TailwindCSS
- RTK Query for client state

## Getting started

NextJS development workflow is straightforward. The dev server command includes `--turbopack` which is still in experimental mode but it should make the dev server run faster.

1. Copy `.env.example` to `.env.local`
2. Setup database connection and add `DATABASE_URL` string
3. Install dependencies and run dev server

```sh
npm install
npm run dev
```

4. Create production build and run server

```sh
npm run build
PORT=3003 npm run start
```
