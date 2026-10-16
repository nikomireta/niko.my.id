import { contentMetadata } from '@/lib/content-metadata'

export function generateMetadata() {
  const metadata = contentMetadata('Blog', 'Posts, case studies, and practical guides on infrastructure and development.', '/blog')
  return { ...metadata, alternates: { ...metadata.alternates, types: { 'application/rss+xml': '/blog/rss.xml' } } }
}
// The persistent desktop opens its Blog window for this route.
export default function BlogPage() { return null }
