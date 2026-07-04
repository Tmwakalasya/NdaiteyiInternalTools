import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home folder confuses Next.js about the
  // project root — pin it explicitly.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
