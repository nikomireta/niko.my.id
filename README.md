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
- On Home, smaller screens initially open only Profile. Opening other windows overlaps Profile in a fixed workspace; only the front window accepts touch, scrolling, and keyboard focus. Direct content URLs open the corresponding list or Reader. Scroll inside its content while the title bar and dock stay visible.
- Startup defaults apply once per page load. Resizing between desktop and mobile preserves which windows you have opened, closed, or minimized.
- Window layout is temporary and resets on refresh.
- All routes share one persistent desktop. Blog opens from the dock with the same drag, close, minimize, and maximize controls. Its type and tag filters remain selected while reading an article or switching windows.
- Opening an entry brings a maximized Reader window to the front. Articles scroll inside the window; its title bar and the bottom dock stay visible. Reader can be minimized/restored from the dock; closing it or pressing Escape returns to the corresponding list. Direct links, refresh, and browser Back/Forward use the same window interface. The article scroll area accepts keyboard focus for Page Up/Down navigation.
- Motion handles drag, maximize/restore, minimize to the dock, and close transitions. Minimized content stays mounted; closed content unmounts after its exit animation.
- The dark glass desktop respects the system's reduced-motion preference, using short fades instead of movement and scale animations.

## Scripts

- `pnpm run dev`: start development server
- `pnpm run typecheck`: run TypeScript checks
- `pnpm run lint`: run ESLint
- `pnpm run build`: typecheck + production build
- `pnpm run start`: run production server

Use `pnpm` (not `npm`) for installs and lockfile updates to keep CI/Vercel builds reproducible.

## Blog

All articles live in `content/blog/<slug>.mdx` and become `/blog/<slug>` after a rebuild. Use lowercase slugs separated by hyphens. The Blog supports ordinary posts (`post`), case studies (`case-study`), and practical guides (`guide`) without a database.

Every article requires `title`, `date`, `summary`, and `type`. Quote dates as `'YYYY-MM-DD'`. All content, including titles and summaries, must be in English and edited with the humanizer skill. See [AGENTS.md](AGENTS.md) for complete frontmatter examples, series rules, and MDX components.

1. Add an MDX file with frontmatter and Markdown or registered MDX components.
2. Put images in `public/images/<slug>/` and reference `/images/<slug>/<filename>`.
3. Run `npm run build` before committing. Commit the content and images, then deploy/rebuild as usual.

Articles with `draft: true` are excluded from public routes, filters, series, sitemap, and RSS, including direct URL access. The Blog can be filtered by type and tag. Case studies show optional role, stack, and project links; ordinary posts and guides use the article layout without these fields.

To create a series, set `series: { slug, title, order }` on its articles. Published parts appear in ascending order at `/blog/series/<slug>`, with Previous/Next links on each part. Series titles must match and published order values must be unique. Draft parts are skipped.

RSS for all published article types is available at `/blog/rss.xml`. `/sitemap.xml` contains the Blog, articles, and published series. Old `/projects` and `/notes` URLs permanently redirect to their `/blog` equivalents, including the old Notes feed.

MDX renders on the server with a shared component registry and syntax highlighting. No imports or JavaScript expressions are needed in content. Content-writing agents must follow the edit boundaries in `AGENTS.md`.

All editorial routes are prerendered. Raw `content/` files are excluded from runtime output tracing, so drafts are not copied into serverless or standalone deployment bundles. Keep the files available during builds.

## Environment variables

Copy `.env.example` to `.env.local` and adjust values:

- `NEXT_PUBLIC_CV_URL`: CV link shown in profile card. If it starts with `/`, it will be treated as a local downloadable file.
- `NEXT_PUBLIC_GITHUB_USERNAME`: GitHub username used for profile links and repository fetching in `/api/github`.
- `GITHUB_TOKEN` (optional): GitHub token for higher API rate limits when fetching repositories in `/api/github`.
