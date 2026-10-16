"use client"

import Link from 'next/link'
import { useState } from 'react'
import type { BlogEntry } from '@/lib/content'
import { BLOG_TYPE_LABELS, BLOG_TYPES, type BlogType } from '@/lib/blog-types'
import { ContentList } from '@/components/content-list'

export function BlogList({ entries }: { entries: BlogEntry[] }) {
  const [type, setType] = useState<BlogType | null>(null)
  const [tag, setTag] = useState<string | null>(null)
  const tags = [...new Set(entries.flatMap((entry) => entry.tags))].sort()
  const visible = entries.filter((entry) => (!type || entry.type === type) && (!tag || entry.tags.includes(tag)))
  const series = [...new Map(entries.filter((entry) => entry.series).map((entry) => [entry.series!.slug, entry.series!])).values()].sort((a, b) => a.title.localeCompare(b.title))
  return <>
    <div className="tag-filter" role="group" aria-label="Filter blog by type">
      <button type="button" className="skill-chip" aria-pressed={type === null} onClick={() => setType(null)}>All</button>
      {BLOG_TYPES.map((value) => <button key={value} type="button" className="skill-chip" aria-pressed={type === value} onClick={() => setType(value)}>{BLOG_TYPE_LABELS[value]}</button>)}
    </div>
    {tags.length > 0 && <div className="tag-filter" role="group" aria-label="Filter blog by tag"><button type="button" className="skill-chip" aria-pressed={tag === null} onClick={() => setTag(null)}>All tags</button>{tags.map((value) => <button type="button" className="skill-chip" key={value} aria-pressed={tag === value} onClick={() => setTag(value)}>{value}</button>)}</div>}
    <p className="sr-only" role="status">{visible.length} articles shown</p>
    <ContentList entries={visible} />
    {visible.length === 0 && (type || tag) && <button type="button" className="blog-clear-filter profile-link" onClick={() => { setType(null); setTag(null) }}>Clear filters</button>}
    {series.length > 0 && <section aria-label="Blog series"><h2 className="repo-caption">Series</h2>{series.map((group) => {
      const count = entries.filter((entry) => entry.series?.slug === group.slug).length
      return <Link className="repo-row" key={group.slug} href={`/blog/series/${group.slug}`} scroll={false}><span className="repo-row-heading">{group.title}</span><span className="repo-meta">{count} published {count === 1 ? 'part' : 'parts'}</span></Link>
    })}</section>}
  </>
}
