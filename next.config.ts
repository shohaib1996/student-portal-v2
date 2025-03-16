import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
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
        ],
    },
};

export default nextConfig;
