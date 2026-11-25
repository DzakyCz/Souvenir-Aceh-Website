const isProduction = process.env.NODE_ENV === "production";

export default {
  // Static export for the production build; dev keeps normal routing for clean 404s.
  ...(isProduction ? { output: "export" } : {}),
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: { cpus: 2 },
  devIndicators: false,
};
