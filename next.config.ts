import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home folder confuses Next.js about the
  // project root — pin it explicitly.
  turbopack: {
    root: __dirname,
  },
  // Homepage films and posters are the heaviest files on the site. Next.js
  // serves public/ files uncached by default; let browsers keep them for a
  // week and Vercel's CDN for a month (each deploy refreshes the CDN copy).
  // If you replace a video, give it a new file name so browsers fetch it.
  async headers() {
    return [
      {
        source: "/media/:file*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
