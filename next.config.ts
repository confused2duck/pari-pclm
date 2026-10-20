import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@libsql/client', 'libsql'],
  outputFileTracingIncludes: {
    '/*': ['./pclm/**/*.html', './pclm/sw.js', './pclm/manifest.webmanifest', './drizzle/*.sql'],
  },
};

export default nextConfig;
