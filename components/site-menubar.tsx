import Link from 'next/link'
import { Terminal } from 'lucide-react'

export function SiteMenubar() {
  return <header className="desktop-menubar">
    <Link href="/" scroll={false} className="desktop-brand"><Terminal aria-hidden="true" /><span>niko<span className="text-primary">.my.id</span></span></Link>
    <span className="desktop-role">DevOps Engineer <span aria-hidden="true">/</span> Sysadmin</span>
  </header>
}
