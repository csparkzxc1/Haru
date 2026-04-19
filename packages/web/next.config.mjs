/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@haru/shared"],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
