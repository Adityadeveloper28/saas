import fs from 'fs';
import path from 'path';

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "ucarecdn.com",
      },
    ],
  },
  server: {
    https: {
      key: fs.readFileSync(path.join(__dirname, 'certificates', 'localhost-key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'certificates', 'localhost.pem')),
    },
  },
};

export default nextConfig;
