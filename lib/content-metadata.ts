import type { Metadata } from 'next'

export const SITE_URL = 'https://niko.my.id'
export function contentMetadata(title: string, description: string, pathname: string, cover?: string, date?: string): Metadata {
  const url = new URL(pathname, SITE_URL).href
  return {
    title: `${title} | Niko Milala`, description, alternates: { canonical: url },
    openGraph: {
      title: `${title} | Niko Milala`, description, url, siteName: 'Niko Milala',
      type: date ? 'article' : 'website', ...(date ? { publishedTime: `${date}T00:00:00Z` } : {}),
      ...(cover ? { images: [{ url: new URL(cover, SITE_URL).href, alt: title }] } : {}),
    },
  }
}
export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
}
