import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
}

export default function SEO({
  title = "Antrian Cerdas - Sistem Antrian Digital",
  description = "Antrian Cerdas adalah aplikasi sistem antrian digital untuk mengelola antrian secara efisien di klinik, bank, restoran, dan layanan publik lainnya.",
  keywords = "antrian digital, sistem antrian, manajemen antrian, aplikasi antrian, qr code antrian, antrian cerdas",
  image = "https://buatantrian.web.id/og-image.jpg",
  url = "https://buatantrian.web.id/",
  type = "website",
  noindex = false,
}: SEOProps) {
  const siteTitle = "Antrian Cerdas";
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;

  return (
    <Helmet>
      {/* Basic tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
}
