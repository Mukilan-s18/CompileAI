import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/settings/',
        '/keys/',
        '/metrics/',
        '/pipeline/',
        '/repair/',
        '/validation/',
        '/benchmarks/',
        '/execution/',
        '/logs/'
      ],
    },
    sitemap: 'https://compile-ai-gilt.vercel.app/sitemap.xml',
  }
}
