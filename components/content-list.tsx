import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { BlogEntry } from '@/lib/content'
import { BLOG_TYPE_LABELS } from '@/lib/blog-types'
import { formatDate } from '@/lib/content-metadata'

export function ContentList({ entries, ordered = false }: { entries: BlogEntry[]; ordered?: boolean }) {
  return <div className="content-list">
    {entries.length === 0 && <p className="content-empty">No articles here yet.</p>}
    {entries.map((entry) => <Link className="repo-row content-row" href={`/blog/${entry.slug}`} scroll={false} key={entry.slug}>
      <div className="repo-meta"><span className="text-primary">{BLOG_TYPE_LABELS[entry.type]}</span>{ordered && entry.series && <span>Part {entry.series.order}</span>}</div>
      <div className="repo-row-heading"><span>{entry.title}</span><ArrowUpRight aria-hidden="true" /></div>
      <p className="repo-description">{entry.summary}</p>
      <div className="repo-meta"><time dateTime={entry.date}>{formatDate(entry.date)}</time>{entry.featured && <span className="text-primary">Featured</span>}{entry.series && !ordered && <span>{entry.series.title} / Part {entry.series.order}</span>}</div>
      <div className="content-chips">{(entry.tags.length ? entry.tags : entry.type === 'case-study' ? entry.stack : []).map((tag) => <span className="skill-chip" key={tag}>{tag}</span>)}</div>
    </Link>)}
  </div>
}
