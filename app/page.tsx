import { ProfileCard } from "@/components/profile-card"
import { ReposList } from "@/components/repos-list"
import { Desktop } from "@/components/desktop"

export default function Home() {
  return (
    <Desktop profile={<ProfileCard />} repos={<ReposList />} />
  )
}
