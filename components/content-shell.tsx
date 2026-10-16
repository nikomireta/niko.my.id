import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

// Window chrome and scrolling are owned by the shared desktop.
export function ContentShell({ children }: { children: ReactNode }) {
  return <div className="content-window-body">
    <Link href="/blog" scroll={false} className="content-back"><ArrowLeft aria-hidden="true" />Back to blog</Link>
    {children}
  </div>
}
