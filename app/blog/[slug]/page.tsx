import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogEntries, getBlogEntry, getBlogSeriesBySlug } from '@/lib/content'
import { BLOG_TYPE_LABELS } from '@/lib/blog-types'
import { contentMetadata, formatDate } from '@/lib/content-metadata'
import { ContentShell } from '@/components/content-shell'
import { ArticleMDX } from '@/components/mdx-components'

export const dynamicParams = false
export async function generateStaticParams() { return (await getBlogEntries()).map(({ slug }) => ({ slug })) }
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props) {
  const entry = await getBlogEntry((await params).slug)
  if (!entry) notFound()
  const metadata = contentMetadata(entry.title, entry.summary, `/blog/${entry.slug}`, entry.cover, entry.date)
  return { ...metadata, alternates: { ...metadata.alternates, types: { 'application/rss+xml': '/blog/rss.xml' } } }
}
export default async function BlogEntryPage({ params }: Props) {
  const entry = await getBlogEntry((await params).slug)
  if (!entry) notFound()
  const series = entry.series ? await getBlogSeriesBySlug(entry.series.slug) : undefined
  const index = series?.entries.findIndex((item) => item.slug === entry.slug) ?? -1
  const previous = series?.entries[index - 1]
  const next = series?.entries[index + 1]
  return <ContentShell><article>
    <header className="content-heading">
      <div className="repo-meta"><span className="text-primary">{BLOG_TYPE_LABELS[entry.type]}</span><time dateTime={entry.date}>{formatDate(entry.date)}</time>{entry.featured && <span className="text-primary">Featured</span>}</div>
      <h1>{entry.title}</h1><p>{entry.summary}</p>
      {entry.type === 'case-study' && entry.role && <p className="content-role">Role: {entry.role}</p>}
      <div className="content-chips">{entry.tags.map((tag) => <span key={tag} className="skill-chip">{tag}</span>)}</div>
      {entry.type === 'case-study' && <>
        <div className="content-chips">{entry.stack.map((item) => <span key={item} className="skill-chip">{item}</span>)}</div>
        {entry.links && <div className="profile-links">{entry.links.map((link) => <a key={link.href} href={link.href} className="profile-link" {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{link.label} ↗</a>)}</div>}
      </>}
    </header>
    {series && entry.series && <aside className="blog-series-banner"><p>Part {entry.series.order} of <Link href={`/blog/series/${series.slug}`} scroll={false}>{series.title}</Link></p><p>{series.entries.length} published {series.entries.length === 1 ? 'part' : 'parts'}</p></aside>}
    {entry.cover && <Image src={entry.cover} alt={entry.title} width={1200} height={750} className="article-image content-cover" sizes="(max-width: 768px) 100vw, 760px" priority />}
    <ArticleMDX source={entry.body} />
    {series && (previous || next) && <nav className="blog-series-navigation" aria-label="Series navigation">
      {previous && <Link href={`/blog/${previous.slug}`} scroll={false} rel="prev" data-direction="previous"><span>← Previous / Part {previous.series!.order}</span>{previous.title}</Link>}
      {next && <Link href={`/blog/${next.slug}`} scroll={false} rel="next" data-direction="next"><span>Next / Part {next.series!.order} →</span>{next.title}</Link>}
    </nav>}
  </article></ContentShell>
}
