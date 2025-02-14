import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions:{
      bodySizeLimit:"100MB"
    }
  },
  images: {
    remotePatterns:[
      {
        protocol:'https',
        hostname:'static.vecteezy.com',

      },
      {
        protocol:'https',
        hostname:'cloud.appwrite.io',
      }
    ]
  }
};

export default nextConfig;
