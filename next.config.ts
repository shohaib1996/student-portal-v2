import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    experimental: {
        turbo: {
            resolveExtensions: [
                '.mdx',
                '.tsx',
                '.ts',
                '.jsx',
                '.js',
                '.mjs',
                '.json',
            ],
        },
    },

    images: {
        localPatterns: [
            {
                pathname: '/**',
                search: '',
            },
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'https',
                hostname: 'nyc3.digitaloceanspaces.com',
            },
            {
                protocol: 'https',
                hostname:
                    'ts4uportal-all-files-upload.nyc3.digitaloceanspaces.com',
            },
            {
                protocol: 'https',
                hostname: 'branch.bootcampshub.ai',
            },
            {
                protocol: 'https',
                hostname: 'png.pngtree.com',
            },
            {
                protocol: 'https',
                hostname: 'i.ibb.co',
            },
            {
                protocol: 'https',
                hostname: 'static.vecteezy.com',
            },
        ],
    },
};

export default nextConfig;
