import { Terminal, FileDown, Linkedin, Github, Mail } from "lucide-react"

const skills = [
  "Docker", "Kubernetes", "Terraform", "AWS", "GCP",
  "Linux", "Nginx", "CI/CD", "Python", "PHP", "Bash", "Git",
]

const CV_URL =
  process.env.NEXT_PUBLIC_CV_URL?.trim() || "https://linkedin.com/in/nikomilala"
const isLocalCv = CV_URL.startsWith("/")
const GITHUB_USERNAME =
  process.env.NEXT_PUBLIC_GITHUB_USERNAME?.trim().replace(/^@/, "") ||
  "nikomilala"
const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`

export function ProfileCard() {
  return (
    <div className="w-full max-w-xl rounded-lg border border-border bg-card overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center gap-2 border-b border-border bg-secondary px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-red-500/70" />
          <span className="size-2.5 rounded-full bg-yellow-500/70" />
          <span className="size-2.5 rounded-full bg-green-500/70" />
        </div>
        <div className="flex items-center gap-1.5 ml-2 text-muted-foreground">
          <Terminal className="size-3" />
          <span className="font-mono text-xs">niko@niko.my.id</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-4">
        {/* Name and title */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Niko Milala</h1>
          <p className="font-mono text-xs text-primary mt-0.5">
            DevOps Engineer & Sysadmin
          </p>
        </div>

        {/* Bio */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          Building and maintaining infrastructure. I keep servers running, pipelines flowing, and systems reliable.
        </p>

        {/* Skills */}
        <div>
          <p className="font-mono text-xs text-muted-foreground mb-2">
            <span className="text-primary">$</span> cat skills.txt
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded bg-secondary px-2 py-0.5 font-mono text-xs text-secondary-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href={CV_URL}
            {...(isLocalCv
              ? { download: true }
              : { target: "_blank", rel: "noopener noreferrer" })}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <FileDown className="size-3" />
            CV
          </a>
          <a
            href="https://linkedin.com/in/nikomilala"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <Linkedin className="size-3" />
            LinkedIn
          </a>
          <a
            href={GITHUB_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <Github className="size-3" />
            GitHub
          </a>
          <a
            href="mailto:nikomiretamilala@gmail.com"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <Mail className="size-3" />
            Email
          </a>
        </div>
      </div>
    </div>
  )
}
