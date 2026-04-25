# Got Houses

A browser for the Great Houses of Westeros, powered by the [An API of Ice and Fire](https://anapioficeandfire.com/).

## Stack

**Frontend**
- Angular 21 — standalone components, signals, lazy-loaded routes
- NgRx Signal Store — state management
- Tailwind CSS — styling
- Material Symbols — icon font (no Angular Material components)
- ESLint + Prettier — linting and formatting
- Vitest + Cypress — unit and e2e tests

**Backend**
- Node.js + Express 5 — REST API at `http://localhost:3000`
- JWT authentication with bcrypt password hashing
- In-memory user store

## Installation

Install dependencies for both the frontend and the backend:

```bash
npm install
cd server && npm install
```

## Running the app

The backend must be running for authentication to work.

**Start the backend** (from the `server/` directory):

```bash
npm run dev
```

**Start the frontend** (from the project root):

```bash
ng serve
```

Then open `http://localhost:4200`.

## Authentication

The app includes optional registration and login. JWT tokens are stored in `localStorage` and restored on page load. Authentication is not enforced — all routes are accessible without an account.

## Code quality

Husky runs two Git hooks automatically:

- **pre-commit** — runs the full test suite; the commit is blocked if any tests fail.
- **commit-msg** — runs [commitlint](https://commitlint.js.org/) to enforce [Conventional Commits](https://www.conventionalcommits.org/) format (e.g. `feat:`, `fix:`, `refactor:`).
