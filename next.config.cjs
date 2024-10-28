/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: [
      "images.unsplash.com",
      "your-supabase-storage-url.supabase.co",
      // Add other domains as needed
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.html$/,
      use: 'ignore-loader',
    });
    return config;
  },
};

module.exports = nextConfig;
