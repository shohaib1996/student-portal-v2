'use client';

import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/utils/common';
import { toast } from 'sonner';

const SharePost = ({
    postUrl,
    postTitle,
}: {
    postUrl: string;
    postTitle: string;
}) => {
    const encodedUrl = encodeURIComponent(postUrl);
    const encodedTitle = encodeURIComponent(postTitle);

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        messenger: `https://www.messenger.com/t/?link=${encodedUrl}`,
    };

    const handleCopy = async (postUrl: string) => {
        const success = await copyToClipboard(postUrl);
        if (success) {
            toast.success('Link copied to clipboard');
        }
    };

    return (
        <div>
            <div className='mt-common-multiplied flex flex-wrap items-center justify-around'>
                <a
                    href={shareLinks.facebook}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <Button className='h-14 w-14 rounded-full' size='icon'>
                        <svg
                            stroke='currentColor'
                            fill='currentColor'
                            strokeWidth='0'
                            viewBox='0 0 320 512'
                            color='white'
                            height='50'
                            width='50'
                            xmlns='http://www.w3.org/2000/svg'
                            style={
                                {
                                    color: 'white',
                                    width: '25px',
                                    height: '25px',
                                } as React.CSSProperties
                            }
                        >
                            <path d='M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z'></path>
                        </svg>
                    </Button>
                </a>
                <a
                    href={shareLinks.twitter}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <Button
                        size='icon'
                        className='h-14 w-14 rounded-full bg-pure-black'
                    >
                        <svg
                            stroke='currentColor'
                            fill='currentColor'
                            strokeWidth='0'
                            viewBox='0 0 512 512'
                            color='white'
                            height='50'
                            width='50'
                            xmlns='http://www.w3.org/2000/svg'
                            style={
                                {
                                    color: 'white',
                                    width: '25px',
                                    height: '25px',
                                } as React.CSSProperties
                            }
                        >
                            <path d='M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z'></path>
                        </svg>
                    </Button>
                </a>
                <a
                    href={shareLinks.linkedin}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <Button
                        className='h-14 w-14 rounded-full bg-[#0A66C2]'
                        size='icon'
                    >
                        <svg
                            stroke='currentColor'
                            fill='currentColor'
                            strokeWidth='0'
                            viewBox='0 0 448 512'
                            color='white'
                            height='50'
                            width='50'
                            xmlns='http://www.w3.org/2000/svg'
                            style={
                                {
                                    color: 'white',
                                    width: '25px',
                                    height: '25px',
                                } as React.CSSProperties
                            }
                        >
                            <path d='M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z'></path>
                        </svg>
                    </Button>
                </a>
                <a
                    href={shareLinks.messenger}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <Button
                        className='h-14 w-14 rounded-full bg-[#00B2FF]'
                        size='icon'
                    >
                        <svg
                            stroke='currentColor'
                            fill='currentColor'
                            strokeWidth='0'
                            viewBox='0 0 512 512'
                            color='white'
                            height='50'
                            width='50'
                            xmlns='http://www.w3.org/2000/svg'
                            style={
                                {
                                    color: 'white',
                                    width: '25px',
                                    height: '25px',
                                } as React.CSSProperties
                            }
                        >
                            <path d='M256.55 8C116.52 8 8 110.34 8 248.57c0 72.3 29.71 134.78 78.07 177.94 8.35 7.51 6.63 11.86 8.05 58.23A19.92 19.92 0 0 0 122 502.31c52.91-23.3 53.59-25.14 62.56-22.7C337.85 521.8 504 423.7 504 248.57 504 110.34 396.59 8 256.55 8zm149.24 185.13l-73 115.57a37.37 37.37 0 0 1-53.91 9.93l-58.08-43.47a15 15 0 0 0-18 0l-78.37 59.44c-10.46 7.93-24.16-4.6-17.11-15.67l73-115.57a37.36 37.36 0 0 1 53.91-9.93l58.06 43.46a15 15 0 0 0 18 0l78.41-59.38c10.44-7.98 24.14 4.54 17.09 15.62z'></path>
                        </svg>
                    </Button>
                </a>
            </div>

            <p className='my-common-multiplied text-center text-lg font-bold text-gray'>
                Or share with link
            </p>
            <div className='flex justify-around rounded-md bg-primary-foreground p-common'>
                <p className='w-[250px] overflow-hidden text-ellipsis whitespace-nowrap xs:w-[350px] sm:w-[550px] md:w-[400px] lg:w-[320px]'>
                    {postUrl}
                </p>
                <p onClick={() => handleCopy(postUrl)}>
                    <svg
                        className='cursor-pointer'
                        stroke='currentColor'
                        fill='currentColor'
                        strokeWidth='0'
                        viewBox='0 0 448 512'
                        color='#27AC1F'
                        height='20'
                        width='20'
                        xmlns='http://www.w3.org/2000/svg'
                        style={{ color: 'rgb(39, 172, 31)' }}
                    >
                        <path d='M433.941 65.941l-51.882-51.882A48 48 0 0 0 348.118 0H176c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48v-48h80c26.51 0 48-21.49 48-48V99.882a48 48 0 0 0-14.059-33.941zM266 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h74v224c0 26.51 21.49 48 48 48h96v42a6 6 0 0 1-6 6zm128-96H182a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h106v88c0 13.255 10.745 24 24 24h88v202a6 6 0 0 1-6 6zm6-256h-64V48h9.632c1.591 0 3.117.632 4.243 1.757l48.368 48.368a6 6 0 0 1 1.757 4.243V112z'></path>
                    </svg>
                </p>
            </div>
        </div>
    );
};

export default SharePost;
