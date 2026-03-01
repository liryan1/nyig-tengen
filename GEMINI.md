# GEMINI.md

This document provides a comprehensive overview of the monorepo, its structure, and the various projects it contains.

## Project Overview

This monorepo houses the backend and frontend services for the New York Institute of Go. The project is built primarily using a TypeScript stack, with multiple interconnected applications and shared libraries.

### Core Technologies

- **Frontend:** React, Next.js, Vite
- **Backend:** Node.js, Express.js
- **Language:** TypeScript
- **Database:** MongoDB (with Mongoose), Prisma
- **Authentication:** Next-Auth
- **Styling:** Tailwind CSS, Radix UI, ShadCN UI
- **Client State Management:** RTK Query
- **Shared Libraries:** `@nyig/models`
- **Form Management:** React Hook Form
- **Schema Validation:** Zod

## Key Projects

The monorepo is organized into several key projects:

- `api`: The main backend API for the NYIG web services. It is a Node.js application using Express.js, Mongoose for MongoDB, and handles user authentication, payments (Stripe), and core business logic.

- `admin`: A React-based admin dashboard built with Vite. It provides a user interface for managing the platform's data.

- `aurora`: A web application built with Next.js.

- `finance`: A Next.js application focused on financial data management, using Next-Auth for authentication and Prisma as an ORM.

- `models`: A crucial shared library containing data models and types used across multiple projects within the monorerepo, using `zod` for schema validation.

- Other projects like `draw`, `events`, `monthly`, `qr`, `services`, `tengen`, and `url` are also part of the ecosystem, each serving a specific purpose.

## Development Conventions

- **Monorepo Structure:** The project is a monorepo with multiple independent but related projects.
- **Shared Models:** The `@nyig/models` library is used to share data structures and ensure consistency across the different services.
- **Code Style:** Prettier is used for code formatting, and ESLint for linting. `lint-staged` is configured to run Prettier on pre-commit.
- **TypeScript:** The entire stack is heavily based on TypeScript, ensuring type safety.
- **ESLint:** The ESLint configuration is defined in `eslint.config.mjs` and extends the `next` configuration. The following rules are disabled:
  - `@typescript-eslint/no-explicit-any`
  - `react-hooks/exhaustive-deps`
- **Git Ignore:** The `.gitignore` file is configured to ignore the following files and directories:
  - `/scripts`
  - `/node_modules`
  - `/.next/`
  - `/out/`
  - `/build`
  - `.env*`
  - `.DS_Store`
  - `*.pem`
  - `npm-debug.log*`
  - `yarn-debug.log*`
  - `yarn-error.log*`
  - `.pnpm-debug.log*`
  - `.vercel`
  - `*.tsbuildinfo`
  - `next-env.d.ts`
- **Pre-commit Hook:** The `.husky/pre-commit` file is configured to run Prettier on all staged files.
- **TypeScript Configuration:** The TypeScript configuration is defined in `tsconfig.json`. It includes the following settings:
  - `target`: `es6`
  - `lib`: `["dom", "dom.iterable", "esnext"]`
  - `allowJs`: `true`
  - `skipLibCheck`: `true`
  - `strict`: `true`
  - `noEmit`: `true`
  - `esModuleInterop`: `true`
  - `module`: `esnext`
  - `moduleResolution`: `bundler`
  - `resolveJsonModule`: `true`
  - `isolatedModules`: `true`
  - `jsx`: `react-jsx`
  - `incremental`: `true`
  - `plugins`: `[{ "name": "next" }]`
  - `paths`: `{ "@/*": ["./*"] }`

## Getting Started

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

## Database Migration

After changing the database schema at `prisma/schema.prisma`, run

```sh
npx prisma db push
```

!! WARNING !! Verify carefully and ensure backwards compatibility.
Then comment out the prod database connection string in `.env` and run the same command again to have the changes reflect in prod.

## Scripts

- `dev`: Starts the Next.js development server with Turbopack.
- `build`: Creates a production build of the Next.js application.
- `start`: Starts the Next.js production server.
- `lint`: Lints the project using Next.js's built-in ESLint configuration.
- `prepare`: Sets up Husky for pre-commit hooks.
- `postinstall`: Generates the Prisma client after `npm install`.
- `db:push`: Pushes the Prisma schema to the database.

## Static Assets

The Next.js application is configured to use remote images from `res.cloudinary.com`.

## Database Schema

The database schema is defined in `prisma/schema.prisma` and uses MongoDB. The schema includes models for:

- **Users and Authentication:** `User`, `Account`, `Session`, `VerificationToken`, `UserInfo`
- **Go Problems:** `Problem`, `ProblemStats`, `ProblemLike`, `ProblemStar`, `ProblemSetProblem`, `ProblemSet`, `ProblemSetStats`, `ProblemSetLike`, `ProblemSetStar`, `ProblemSetLeaderboardEntry`, `Submission`, `ProblemSetProgress`, `ProblemEndorsement`
- **Teams:** `Team`, `TeamProblem`, `TeamProblemSet`, `TeamMembership`, `TeamInvite`
- **Challenges:** `ChallengeProblem`, `ChallengeAttempt`, `ChallengeRecord`
- **Other:** `Counter`

## Frontend

The frontend is a Next.js application with the root layout defined in `app/layout.tsx`. The layout includes:

- **Providers:** `SessionProvider` for Next-Auth, `ReduxProvider` for Redux Toolkit, `NuqsAdapter` for query string management, and `SidebarProvider` for the application's sidebar.
- **Navigation:** `AppSidebar` and `NavHeader` for the main navigation.
- **UI:** `Toaster` for notifications.
- **Fonts:** The `Inter` font is used throughout the application.
- **Metadata:** The metadata for the application is defined in the `metadata` object.

## Pages

- **Home:** The home page is defined in `app/(home)/page.tsx` and displays a welcome message to the user, as well as links to other parts of the application.

## Authentication

The application uses Next-Auth for authentication, with the following providers:

- **GitHub:** `GithubProvider`
- **Google:** `GoogleProvider`
- **Credentials:** `CredentialsProvider`

The authentication options are defined in `app/api/auth/authOptions.ts` and include callbacks for JWT and session management, a session strategy of "jwt" with a max age of 30 days, and custom pages for sign-in and error handling.

The credentials provider is defined in `app/api/auth/[...nextauth]/credentials.ts` and uses `bcrypt` to compare the user's password with the hashed password in the database.

## Components

- **Sidebar:** The sidebar is defined in `components/ui/sidebar.tsx` and is a highly customizable component that can be used to display navigation links and other content. It is built using Radix UI and includes features such as collapsible sections, tooltips, and keyboard shortcuts.

## Utility Functions

The `lib/utils.ts` file contains a number of utility functions that are used throughout the application. These include:

- `cn`: A function that merges Tailwind CSS classes.
- `sanitizeHtml`: A function that removes HTML tags from a string.
- `formatLargeNumber`: A function that formats a large number into a more readable format (e.g., 1000 -> 1k).
- `truncateString`: A function that truncates a string to a specified length.
- `debounce`: A function that debounces a function.
- `isUserAdmin`: A function that checks if a user is an admin.

## Styling

The project uses Tailwind CSS for styling, with the configuration defined in `tailwind.config.ts`. The configuration includes:

- **Dark Mode:** Enabled using the `class` strategy.
- **Content:** The content is configured to scan the `pages`, `components`, and `app` directories for Tailwind CSS classes.
- **Theme:** The theme is extended with custom colors, border radiuses, and animations.
- **Plugins:** The `tailwindcss-animate` plugin is used for animations.

## UI Components

The project uses `shadcn/ui` for its UI components, with the configuration defined in `components.json`. The configuration includes:

- **Style:** `new-york`
- **RSC:** `true`
- **TSX:** `true`
- **Tailwind:** The Tailwind CSS configuration is defined in `tailwind.config.ts`.
- **Aliases:** Aliases are configured for `components`, `utils`, `ui`, `lib`, and `hooks`.
- **Icon Library:** `lucide`

## Hooks

- **useGo:** The `useGo` hook is defined in `hooks/useGo.ts` and is used to manage the state of a Go game. It includes functions for handling moves, editing the board, and navigating the game tree.

## Go Game Logic

The `lib/go/goGame.ts` file contains the `GoGame` class, which is used to manage the logic of a Go game. The class includes methods for:

- **Creating a new game:** `GoGame.empty()`
- **Loading a game from an SGF file:** `GoGame.fromSgf()`
- **Getting the board state:** `getBoardState()`
- **Playing a move:** `playMove()`
- **Playing a pass:** `playPass()`
- **Editing the board:** `makeEdits()`
- **Deleting a node from the game tree:** `deleteNode()`
- **Swapping colors:** `swapColors()`
- **Setting the board size:** `setBoardState()`

## SGF Parser

The `lib/go/parser.ts` file contains a small SGF parser and serializer for the `SgfNode` structure. The parser can:

- **Parse an SGF string into an `SgfNode` tree:** `fromSgf()`
- **Serialize an `SgfNode` tree into an SGF string:** `toSgf()`
- **Get the board size from an SGF string:** `getBoardSize()`
- **Get the root board state from an SGF string:** `getRootBoardState()`
- **Get problem info from comments:** `getProblemInfoFromComments()`

## Client State Management

The project uses RTK Query for client-side state management. The API is defined in `lib/rtk/api.ts` and includes the following tag types:

- `AUTH_TAG`
- `TEAMS_TAG`
- `TEAM_INVITES_TAG`
- `PROBLEMS_TAG`
- `PROBLEM_TAG`
- `PROBLEM_SETS_TAG`
- `PROBLEM_SET_TAG`

The base query is configured to use the `/api` endpoint.

The Redux store is configured in `lib/rtk/store.ts` and includes the `apiSlice` and `completionSlice` reducers, as well as the `rtkQueryErrorLogger` middleware.

## API

- **Problems:** The `app/api/problems/route.ts` file defines the API for fetching a list of Go problems. The API supports pagination, filtering by rank and creator, and sorting by likes and views.
- **Problem:** The `app/api/problems/[num]/route.ts` file defines the API for fetching, updating, and deleting a single Go problem.
  - `GET`: Fetches a single problem.
  - `PATCH`: Updates a single problem.
  - `DELETE`: Deletes a single problem.
- **Teams:** The `app/api/teams/route.ts` file defines the API for fetching and creating teams.
  - `GET`: Fetches a list of teams.
  - `POST`: Creates a new team.
- **Team:** The `app/api/teams/[slug]/route.ts` file defines the API for fetching and updating a single team.
  - `GET`: Fetches a single team.
  - `PATCH`: Updates a single team.
- **Team Invites:** The `app/api/teams/invites/route.ts` file defines the API for fetching team invites.
  - `GET`: Fetches a list of team invites.
- **Challenge Start:** The `app/api/challenge/start/route.ts` file defines the API for starting a new challenge.
  - `GET`: Starts a new challenge.
- **Challenge Submission:** The `app/api/challenge/[attemptId]/route.ts` file defines the API for submitting a challenge.
  - `POST`: Submits a challenge.

## Challenge Logic

The `lib/challenge.ts` file contains the logic for the challenge mode. This includes:

- **Constants:** `PROBLEMS_BATCH_SIZE`, `START_TIME_MS`, `CORRECT_BONUS_MS`
- **Difficulty Zones:** The `DIFFICULTY_ZONES` constant defines the difficulty zones for the randomizer.
- **Get Random Problems:** The `getRandomProblems()` function fetches a random set of problems for the challenge.
- **Get Period Start:** The `getPeriodStart()` function gets the start date for a given leaderboard period.
- **Is Better Score:** The `isBetterScore()` function determines if a new score is better than an existing score.
