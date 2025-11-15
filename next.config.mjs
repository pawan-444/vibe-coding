/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.externals = [...config.externals, 'pino-pretty', 'lokijs', 'encoding'];
    return config;
  }
};

export default nextConfig;
