"use client"

import useSWR from "swr"
import { ArrowUpRight, Github, Star, Loader2 } from "lucide-react"

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
    <div className="repos-content">
      <p className="repo-caption">Public repositories / GitHub</p>
      {isLoading && (
        <div className="repo-state" role="status"><Loader2 className="animate-spin" aria-hidden="true" /><span>fetching...</span></div>
      )}
      {(error || (data && !Array.isArray(data))) && (
        <div className="repo-state" role="status">
          <Github aria-hidden="true" /><span>unable to load repos</span>
          <a href={GITHUB_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary">view on github</a>
        </div>
      )}
      {data && Array.isArray(data) && data.length === 0 && (
        <div className="repo-state"><Github aria-hidden="true" /><span>no public repos yet</span></div>
      )}
      {data && Array.isArray(data) && data.slice(0, 6).map((repo) => (
        <a key={repo.id} href={repo.url} target="_blank" rel="noopener noreferrer" className="repo-row">
          <div className="repo-row-heading"><span>{repo.name}</span><ArrowUpRight aria-hidden="true" /></div>
          {repo.description && <p className="repo-description line-clamp-2">{repo.description}</p>}
          {(repo.language || repo.stars > 0) && (
            <div className="repo-meta">
              {repo.language && <span><span className={`size-1.5 rounded-full ${langColor[repo.language] || "bg-muted-foreground"}`} />{repo.language}</span>}
              {repo.stars > 0 && <span><Star aria-hidden="true" />{repo.stars}</span>}
            </div>
          )}
        </a>
      ))}
    </div>
  )
}
