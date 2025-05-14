import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  serverExternalPackages: [
    'ts-morph',
    'typescript',
    'twoslash',
  ],
  transpilePackages: ["next-mdx-remote"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'abs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/hackathon',
        destination: '/hackathons/26bfce9b-4d44-4d40-8fbe-7903e76d48fa',
        permanent: true,
      },
      // Redirects for moved precompile files
      {
        source: '/docs/virtual-machines/custom-precompiles/:path*',
        destination: '/docs/avalanche-l1s/:path*',
        permanent: true,
      },
      {
        source: '/docs/avalanche-l1s/default-precompiles/permissions',
        destination: '/docs/avalanche-l1s/permissions',
        permanent: true,
      },
      {
        source: '/docs/avalanche-l1s/default-precompiles/allowlist',
        destination: '/docs/avalanche-l1s/allowlist',
        permanent: true,
      },
      {
        source: '/docs/avalanche-l1s/default-precompiles/tokenomics',
        destination: '/docs/avalanche-l1s/tokenomics',
        permanent: true,
      },
      {
        source: '/docs/avalanche-l1s/default-precompiles/transaction-fees',
        destination: '/docs/avalanche-l1s/transaction-fees',
        permanent: true,
      },
      {
        source: '/docs/avalanche-l1s/default-precompiles/warpmessenger',
        destination: '/docs/avalanche-l1s/warpmessenger',
        permanent: true,
      },
      // Handle any old VM docs references to precompiles
      {
        source: '/docs/virtual-machines/precompiles/:path*',
        destination: '/docs/avalanche-l1s/:path*',
        permanent: true,
      },
    ];
  },
};

export default withMDX(config);
