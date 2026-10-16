import 'server-only'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'
import { BLOG_TYPES } from '@/lib/blog-types'

const text = z.string().trim().min(1)
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').refine((value) => {
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}, 'Use a valid calendar date')
const href = text.refine((value) => /^https?:\/\//.test(value) || /^\/(?!\/)/.test(value), 'Use an http(s) URL or a local absolute path')
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const blogSchema = z.object({
  title: text, date, summary: text, type: z.enum(BLOG_TYPES),
  tags: z.array(text).default([]), draft: z.boolean().default(false), role: text.optional(),
  stack: z.array(text).default([]), featured: z.boolean().default(false),
  cover: href.optional(), links: z.array(z.object({ label: text, href })).optional(),
  series: z.object({ slug: text.regex(slugPattern, 'Use a lowercase, hyphen-separated slug'), title: text, order: z.number().int().positive() }).optional(),
})
export type BlogEntry = z.infer<typeof blogSchema> & { slug: string }
export type BlogSeries = { slug: string; title: string; entries: BlogEntry[] }

async function readEntries() {
  const directory = path.join(process.cwd(), 'content', 'blog')
  let files: string[]
  try { files = await readdir(directory) } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
  const entries = await Promise.all(files.filter((file) => file.endsWith('.mdx')).map(async (file) => {
    const filename = path.join(directory, file)
    const slug = file.slice(0, -4)
    if (!slugPattern.test(slug)) throw new Error(`${filename}: slug must use lowercase letters, numbers, and hyphens`)
    let parsed: ReturnType<typeof matter>
    try { parsed = matter(await readFile(filename, 'utf8')) } catch (error) {
      throw new Error(`${filename}: unable to read frontmatter: ${String(error)}`)
    }
    const result = blogSchema.safeParse(parsed.data)
    if (!result.success) throw new Error(`${filename}: ${result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`)
    return { ...result.data, slug, body: parsed.content }
  }))
  const published = entries.filter((entry) => !entry.draft)
  const series = new Map<string, { title: string; orders: Set<number> }>()
  for (const entry of published) {
    if (!entry.series) continue
    const group = series.get(entry.series.slug) ?? { title: entry.series.title, orders: new Set<number>() }
    if (group.title !== entry.series.title) throw new Error(`${path.join(directory, `${entry.slug}.mdx`)}: series.title must match the other entries in ${entry.series.slug}`)
    if (group.orders.has(entry.series.order)) throw new Error(`${path.join(directory, `${entry.slug}.mdx`)}: duplicate series.order ${entry.series.order} in ${entry.series.slug}`)
    group.orders.add(entry.series.order)
    series.set(entry.series.slug, group)
  }
  return published.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
}
export async function getBlogEntries(): Promise<BlogEntry[]> {
  return (await readEntries()).map((entry) => ({ ...blogSchema.parse(entry), slug: entry.slug }))
}
export async function getBlogEntry(slug: string) {
  return (await readEntries()).find((entry) => entry.slug === slug)
}
export async function getBlogSeries(): Promise<BlogSeries[]> {
  const groups = new Map<string, BlogSeries>()
  for (const entry of await getBlogEntries()) {
    if (!entry.series) continue
    const group = groups.get(entry.series.slug) ?? { slug: entry.series.slug, title: entry.series.title, entries: [] }
    group.entries.push(entry)
    groups.set(group.slug, group)
  }
  return [...groups.values()].map((group) => ({ ...group, entries: group.entries.sort((a, b) => a.series!.order - b.series!.order) })).sort((a, b) => a.title.localeCompare(b.title))
}
export async function getBlogSeriesBySlug(slug: string) {
  return (await getBlogSeries()).find((group) => group.slug === slug)
}
