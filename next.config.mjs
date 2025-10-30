/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push(
      "vertx", // The one from before
      "bufferutil", // The new one
      "utf-8-validate" // The other new one
    );
    return config;
  },
};

export default nextConfig;
