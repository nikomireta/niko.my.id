import type { MetadataRoute } from 'next'
import { getBlogEntries, getBlogSeries } from '@/lib/content'
import { SITE_URL } from '@/lib/content-metadata'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [entries, series] = await Promise.all([getBlogEntries(), getBlogSeries()])
  return [
    ...['', '/blog'].map((pathname) => ({ url: `${SITE_URL}${pathname}` })),
    ...entries.map((entry) => ({ url: `${SITE_URL}/blog/${entry.slug}`, lastModified: entry.date })),
    ...series.map((group) => ({ url: `${SITE_URL}/blog/series/${group.slug}`, lastModified: group.entries.reduce((latest, entry) => entry.date > latest ? entry.date : latest, group.entries[0].date) })),
  ]
}
