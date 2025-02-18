import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com',"images.unsplash.com"], // Add any external image domains here
  },
};

export default nextConfig;
