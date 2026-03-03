import { NextResponse } from "next/server"

const GITHUB_USERNAME =
  process.env.NEXT_PUBLIC_GITHUB_USERNAME?.trim().replace(/^@/, "") ||
  "nikomilala"
const REVALIDATE_SECONDS = 3600
const REQUEST_TIMEOUT_MS = 8000

interface GithubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  topics?: string[]
  fork: boolean
}

interface RepoResponse {
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

export async function GET() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github+json",
      "User-Agent": "niko-portfolio",
      "X-GitHub-Api-Version": "2022-11-28",
    }
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    }

    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30&type=public`,
      {
        headers,
        next: { revalidate: REVALIDATE_SECONDS },
        signal: controller.signal,
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: `GitHub API responded with status ${response.status}` },
        { status: 502 }
      )
    }

    const repos = (await response.json()) as GithubRepo[]

    if (!Array.isArray(repos)) {
      throw new Error("Unexpected GitHub API response")
    }

    const filteredRepos: RepoResponse[] = repos
      .filter((repo) => !repo.fork)
      .slice(0, 6)
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updated_at: repo.updated_at,
        topics: repo.topics || [],
      }))

    return NextResponse.json(filteredRepos)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown internal error"
    return NextResponse.json(
      { error: "Failed to fetch repositories", message },
      { status: 500 }
    )
  } finally {
    clearTimeout(timeout)
  }
}
