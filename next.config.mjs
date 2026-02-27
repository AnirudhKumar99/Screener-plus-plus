/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3', '@prisma/client', 'prisma'],
};

export default nextConfig;
