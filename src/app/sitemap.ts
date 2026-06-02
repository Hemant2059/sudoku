import type { MetadataRoute } from "next";

const baseUrl = "https://sudozen.vercel.app";

const variants = [
  "xsudoku", "hyper", "antiknight", "antiking", "thermo", "arrow",
  "palindrome", "renban", "kropki", "xv", "greaterthan",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const variantPages = variants.map((v) => ({
    url: `${baseUrl}/play/extra-rule/${v}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/play`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/play/classic`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/play/killer`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/play/extra-rule`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/play/custom`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/solver`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/learn`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    ...variantPages,
  ];
}
