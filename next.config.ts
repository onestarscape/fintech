import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Wix (www.fastuploans.com) is now the real public homepage — it owns
  // the marketing story, About, and Privacy Policy. This app is the
  // operational portal: login, the guided apply flow, and every
  // dashboard. Rather than maintain two different homepages / About
  // pages / Privacy Policies that could quietly drift out of sync with
  // each other, these routes redirect straight to the Wix equivalents.
  // Everything Wix genuinely can't do — product pages, the apply flow,
  // every portal — stays here, untouched.
  async redirects() {
    return [
      { source: "/", destination: "https://www.fastuploans.com", permanent: false },
      { source: "/about", destination: "https://www.fastuploans.com/about-1", permanent: false },
      { source: "/contact", destination: "https://www.fastuploans.com", permanent: false },
      { source: "/privacy", destination: "https://www.fastuploans.com/privacy-policy", permanent: false },
    ];
  },
};

export default nextConfig;
