/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/notes/rss.xml', destination: '/blog/rss.xml', permanent: true },
      { source: '/projects', destination: '/blog', permanent: true },
      { source: '/notes', destination: '/blog', permanent: true },
      { source: '/projects/:slug', destination: '/blog/:slug', permanent: true },
      { source: '/notes/:slug', destination: '/blog/:slug', permanent: true },
    ]
  },
  // Editorial routes are prerendered. Raw MDX (including drafts) is build input,
  // and must not be copied into serverless/standalone runtime bundles.
  outputFileTracingExcludes: {
    '/*': ['./content/**/*'],
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
