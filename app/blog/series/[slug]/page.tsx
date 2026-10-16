import { notFound } from 'next/navigation'
import { getBlogSeries, getBlogSeriesBySlug } from '@/lib/content'
import { contentMetadata } from '@/lib/content-metadata'
import { ContentList } from '@/components/content-list'
import { ContentShell } from '@/components/content-shell'

export const dynamicParams = false
export async function generateStaticParams() { return (await getBlogSeries()).map(({ slug }) => ({ slug })) }
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props) {
  const series = await getBlogSeriesBySlug((await params).slug)
  if (!series) notFound()
  return contentMetadata(series.title, `Read ${series.title} in order, with ${series.entries.length} published ${series.entries.length === 1 ? 'part' : 'parts'}.`, `/blog/series/${series.slug}`)
}
export default async function BlogSeriesPage({ params }: Props) {
  const series = await getBlogSeriesBySlug((await params).slug)
  if (!series) notFound()
  return <ContentShell><header className="content-heading"><p className="profile-skills-label">Series / {series.entries.length} published {series.entries.length === 1 ? 'part' : 'parts'}</p><h1>{series.title}</h1><p>Read the articles in order.</p></header><ContentList entries={series.entries} ordered /></ContentShell>
}
