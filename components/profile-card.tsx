import { FileDown, Linkedin, Github, Mail } from "lucide-react"

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
    <div className="profile-content">
      {/* Name and title */}
      <div className="profile-identity">
        <div className="profile-avatar" aria-hidden="true">NM</div>
        <div>
          <h1 className="profile-name">Niko Milala</h1>
          <p className="profile-role">
            DevOps Engineer & Sysadmin
          </p>
        </div>
      </div>

      {/* Bio */}
      <p className="profile-bio">
        Building and maintaining infrastructure. I keep servers running, pipelines flowing, and systems reliable.
      </p>

      {/* Skills */}
      <div>
        <p className="profile-skills-label">
          <span className="text-primary">$</span> cat skills.txt
        </p>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <span
              key={skill}
              className="skill-chip"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="profile-links">
        <a
          href={CV_URL}
          {...(isLocalCv
            ? { download: true }
            : { target: "_blank", rel: "noopener noreferrer" })}
          className="profile-link profile-link-primary"
        >
          <FileDown className="size-3" />
          CV
        </a>
        <a
          href="https://linkedin.com/in/nikomilala"
          target="_blank"
          rel="noopener noreferrer"
          className="profile-link"
        >
          <Linkedin className="size-3" />
          LinkedIn
        </a>
        <a
          href={GITHUB_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="profile-link"
        >
          <Github className="size-3" />
          GitHub
        </a>
        <a
          href="mailto:nikomiretamilala@gmail.com"
          className="profile-link"
        >
          <Mail className="size-3" />
          Email
        </a>
      </div>
    </div>
  )
}
