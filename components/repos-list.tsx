"use client"

import useSWR from "swr"
import { Star, ExternalLink, Github, Loader2 } from "lucide-react"

interface Repo {
  id: number
  name: string
  description: string | null
  url: string
  language: string | null
  stars: number
  forks: number
  updated_at: string
  topics: string[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())
const GITHUB_USERNAME =
  process.env.NEXT_PUBLIC_GITHUB_USERNAME?.trim().replace(/^@/, "") ||
  "nikomilala"
const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`

const langColor: Record<string, string> = {
  TypeScript: "bg-blue-400",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-400",
  Go: "bg-cyan-400",
  Shell: "bg-emerald-400",
  Dockerfile: "bg-sky-400",
  HCL: "bg-indigo-400",
  Rust: "bg-orange-400",
  Java: "bg-red-400",
  PHP: "bg-violet-400",
}

export function ReposList() {
  const { data, error, isLoading } = useSWR<Repo[]>("/api/github", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 600000,
  })

  return (
    <div className="w-full max-w-xl rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Github className="size-3" />
          <span className="font-mono text-xs">repos</span>
        </div>
        <a
          href={GITHUB_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="View all on GitHub"
        >
          <ExternalLink className="size-3" />
        </a>
      </div>

      {/* Repo list */}
      <div className="divide-y divide-border max-h-64 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin text-primary" />
            <span className="font-mono text-xs">fetching...</span>
          </div>
        )}

        {(error || (data && !Array.isArray(data))) && (
          <div className="flex flex-col items-center justify-center py-8 gap-1.5 text-muted-foreground">
            <span className="font-mono text-xs">unable to load repos</span>
            <a
              href={GITHUB_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-primary hover:underline"
            >
              view on github
            </a>
          </div>
        )}

        {data && Array.isArray(data) && data.length === 0 && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <span className="font-mono text-xs">no public repos yet</span>
          </div>
        )}

        {data &&
          Array.isArray(data) &&
          data.slice(0, 6).map((repo) => (
            <a
              key={repo.id}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                {repo.language && (
                  <span
                    className={`size-2 rounded-full shrink-0 ${langColor[repo.language] || "bg-muted-foreground"}`}
                  />
                )}
                <span className="font-mono text-xs text-card-foreground group-hover:text-primary transition-colors truncate">
                  {repo.name}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-muted-foreground">
                {repo.stars > 0 && (
                  <span className="flex items-center gap-0.5 text-xs">
                    <Star className="size-2.5" />
                    {repo.stars}
                  </span>
                )}
                {repo.language && (
                  <span className="font-mono text-xs hidden sm:inline">
                    {repo.language}
                  </span>
                )}
              </div>
            </a>
          ))}
      </div>
    </div>
  )
}
