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
      // Redirects from old VM paths
      {
        source: '/docs/virtual-machines/default-precompiles/deployerallowlist',
        destination: '/docs/avalanche-l1s/permissions',
        permanent: true,
      },
      {
        source: '/docs/virtual-machines/default-precompiles/txallowlist',
        destination: '/docs/avalanche-l1s/permissions',
        permanent: true,
      },
      {
        source: '/docs/virtual-machines/default-precompiles/contractnativeminter',
        destination: '/docs/avalanche-l1s/tokenomics',
        permanent: true,
      },
      {
        source: '/docs/virtual-machines/default-precompiles/feemanager',
        destination: '/docs/avalanche-l1s/transaction-fees',
        permanent: true,
      },
      {
        source: '/docs/virtual-machines/default-precompiles/rewardmanager',
        destination: '/docs/avalanche-l1s/transaction-fees',
        permanent: true,
      },
      {
        source: '/docs/virtual-machines/default-precompiles/warpmessenger',
        destination: '/docs/avalanche-l1s/warpmessenger',
        permanent: true,
      }
    ];
  },
};

export default withMDX(config);
