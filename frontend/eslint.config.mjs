/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ⚠️ Danger: This will completely skip ESLint checks during `next build`
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
