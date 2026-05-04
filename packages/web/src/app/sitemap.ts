import type { MetadataRoute } from "next";

const PUBLIC_BASE = process.env.NEXT_PUBLIC_WEB_BASE ?? "https://haru.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${PUBLIC_BASE}/`, lastModified: now, priority: 1 },
    { url: `${PUBLIC_BASE}/login`, lastModified: now, priority: 0.5 },
    { url: `${PUBLIC_BASE}/register`, lastModified: now, priority: 0.5 },
    { url: `${PUBLIC_BASE}/privacy`, lastModified: now, priority: 0.3 },
    { url: `${PUBLIC_BASE}/terms`, lastModified: now, priority: 0.3 },
  ];
}
