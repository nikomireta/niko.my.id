import 'server-only'
import type { ComponentProps, ReactNode } from 'react'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

function Callout({ title, children }: { title?: string; children: ReactNode }) {
  return <aside className="article-callout">{title && <p className="article-callout-title">{title}</p>}{children}</aside>
}
function Section({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  return <section id={id} className="article-section"><h2>{title}</h2>{children}</section>
}
function Gallery({ children }: { children: ReactNode }) {
  return <div className="article-gallery">{children}</div>
}
function ArticleImage({ src, alt = '', title }: ComponentProps<'img'>) {
  if (typeof src !== 'string') return null
  return <Image className="article-image" src={src} alt={alt} title={title} width={1200} height={750} sizes="(max-width: 768px) 100vw, 760px" />
}
const components = {
  Callout, Section, Gallery, Tabs, TabsList, TabsTrigger, TabsContent,
  img: ArticleImage,
  a: ({ href, children, ...props }: ComponentProps<'a'>) => <a href={href} {...props} {...(/^https?:\/\//.test(href ?? '') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>,
}
export function ArticleMDX({ source }: { source: string }) {
  return <div className="article-body"><MDXRemote source={source} components={components} options={{ mdxOptions: {
    remarkPlugins: [remarkGfm], rehypePlugins: [[rehypePrettyCode, { theme: 'github-dark', keepBackground: false }]],
  } }} /></div>
}
