import { getBlogEntries } from '@/lib/content'
import { SITE_URL } from '@/lib/content-metadata'
import { BLOG_TYPE_LABELS } from '@/lib/blog-types'

export const dynamic = 'force-static'
function xml(value: string) {
  return value.replace(/[<>&"']/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]!)
}
export async function GET() {
  const entries = await getBlogEntries()
  const items = entries.map((entry) => {
    const url = `${SITE_URL}/blog/${entry.slug}`
    const categories = [BLOG_TYPE_LABELS[entry.type], ...entry.tags]
    return `<item><title>${xml(entry.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${xml(entry.summary)}</description><pubDate>${new Date(`${entry.date}T00:00:00Z`).toUTCString()}</pubDate>${categories.map((tag) => `<category>${xml(tag)}</category>`).join('')}</item>`
  }).join('')
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Niko Milala / Blog</title><link>${SITE_URL}/blog</link><description>Posts, case studies, and practical guides on infrastructure and development.</description><language>en</language><atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
