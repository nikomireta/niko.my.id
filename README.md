# DevOps Engineer Portfolio

Portfolio site built with Next.js App Router, TypeScript, and Tailwind CSS.

## Run locally

```bash
pnpm install
pnpm run dev
```

Open `http://localhost:3000`.

## Scripts

- `pnpm run dev`: start development server
- `pnpm run typecheck`: run TypeScript checks
- `pnpm run lint`: run ESLint
- `pnpm run build`: typecheck + production build
- `pnpm run start`: run production server

Use `pnpm` (not `npm`) for installs and lockfile updates to keep CI/Vercel builds reproducible.

## Environment variables

Copy `.env.example` to `.env.local` and adjust values:

- `NEXT_PUBLIC_CV_URL`: CV link shown in profile card. If it starts with `/`, it will be treated as a local downloadable file.
- `NEXT_PUBLIC_GITHUB_USERNAME`: GitHub username used for profile links and repository fetching in `/api/github`.
- `GITHUB_TOKEN` (optional): GitHub token for higher API rate limits when fetching repositories in `/api/github`.
