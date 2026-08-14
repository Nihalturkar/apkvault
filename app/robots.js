export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard-x7k9/", "/api/"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://apkvault.vercel.app"}/sitemap.xml`,
  };
}
