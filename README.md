# DevOps Engineer Portfolio

Portfolio site built with Next.js App Router, TypeScript, Tailwind CSS, and Motion for React.

## Run locally

```bash
pnpm install
pnpm run dev
```

Open `http://localhost:3000`.

## Portfolio windows

- On desktop (1024px and wider), drag a window's title bar to move it. Focus the title bar and use arrow keys to move it with a keyboard; hold Shift for larger steps.
- The red, yellow, and green controls close, minimize, and maximize/restore each window.
- Use the bottom dock to minimize the active window, focus a window behind it, or reopen one. Minimize preserves its position, scroll, and maximized state; reopening a closed window resets it.
- Smaller screens initially open only Profile. Opening Repos overlaps Profile in a fixed workspace; only the front window accepts touch, scrolling, and keyboard focus. Scroll inside its content while the title bar and dock stay visible.
- Startup defaults apply once per page load. Resizing between desktop and mobile preserves which windows you have opened, closed, or minimized.
- Window layout is temporary and resets on refresh.
- Motion handles drag, maximize/restore, minimize to the dock, and close transitions. Minimized content stays mounted; closed content unmounts after its exit animation.
- The dark glass desktop respects the system's reduced-motion preference, using short fades instead of movement and scale animations.

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
