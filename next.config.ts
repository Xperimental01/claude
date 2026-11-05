import type { NextConfig } from "next";

/**
 * GitHub Pages serves this project from https://<user>.github.io/claude, so
 * every route and asset sits under /claude.
 *
 * The value is also exported to the client as NEXT_PUBLIC_BASE_PATH. Client
 * code that builds its own URLs — notably the live-refresh poller fetching
 * data/fetched-events.json — needs the prefix too, and reading it from here
 * keeps a single source of truth rather than two literals that can drift.
 */
const basePath = "/claude";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
