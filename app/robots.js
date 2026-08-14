export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard-x7k9/", "/api/"],
      },
    ],
    sitemap: "https://apkvault.vercel.app/sitemap.xml",
  };
}
