import { Helmet } from 'react-helmet-async'

export default function SEO({ title, description, url = 'https://shapio.in' }) {
  const siteName = 'Shapio 3D Technologies'
  const fullTitle = title ? `${title} | ${siteName}` : siteName
  const metaDescription = description || 'End-to-end additive manufacturing solutions. FDM, SLA, SLS, and Custom 3D Prototyping.'

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${url}/og-image.jpg`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={`${url}/og-image.jpg`} />
    </Helmet>
  )
}
