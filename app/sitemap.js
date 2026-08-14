import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://apkvault-umber.vercel.app";

export default async function sitemap() {
  const routes = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  try {
    const q = query(collection(db, "apps"), where("published", "==", true));
    const snapshot = await getDocs(q);

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      routes.push({
        url: `${BASE_URL}/app/${data.slug || doc.id}`,
        lastModified: data.updatedAt?.toDate() || new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });
  } catch (err) {
    console.error("Sitemap generation error:", err);
  }

  return routes;
}
