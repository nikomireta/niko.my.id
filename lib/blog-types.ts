export const BLOG_TYPES = ['post', 'case-study', 'guide'] as const
export type BlogType = (typeof BLOG_TYPES)[number]
export const BLOG_TYPE_LABELS: Record<BlogType, string> = {
  post: 'Post',
  'case-study': 'Case study',
  guide: 'Guide',
}
