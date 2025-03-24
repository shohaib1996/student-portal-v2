'use client';

import Image from 'next/image';

interface Attachment {
    _id: string;
    url: string;
    name: string;
}

interface Post {
    attachments: Attachment[];
}

export default function PostImageGrid({ post }: { post: Post }) {
    const attachments = post?.attachments || [];

    return (
        <>
            {/* Single Attachment */}
            {attachments.length === 1 && (
                <div className='my-2'>
                    <Image
                        src={attachments[0].url}
                        alt={attachments[0].name}
                        width={996}
                        height={747}
                        className='rounded-lg w-full h-[380px] object-cover'
                    />
                </div>
            )}

            {/* Two Attachments */}
            {attachments.length === 2 && (
                <div className='grid grid-cols-2 gap-2 my-2'>
                    <Image
                        src={attachments[0].url}
                        alt={attachments[0].name}
                        width={996}
                        height={747}
                        className='rounded-lg w-full h-[380px] object-cover'
                    />
                    <Image
                        src={attachments[1].url}
                        alt={attachments[1].name}
                        width={1060}
                        height={706}
                        className='rounded-lg w-full h-[380px] object-cover'
                    />
                </div>
            )}

            {/* Three Attachments */}
            {attachments.length === 3 && (
                <div className='grid grid-cols-3 gap-2 my-2'>
                    <Image
                        src={attachments[0].url}
                        alt={attachments[0].name}
                        width={996}
                        height={747}
                        className='rounded-lg w-full h-[380px] object-cover'
                    />
                    <Image
                        src={attachments[1].url}
                        alt={attachments[1].name}
                        width={1060}
                        height={706}
                        className='rounded-lg w-full h-[380px] object-cover'
                    />
                    <Image
                        src={attachments[2].url}
                        alt={attachments[2].name}
                        width={740}
                        height={1109}
                        className='rounded-lg w-full h-[380px] object-cover'
                    />
                </div>
            )}

            {/* Four Attachments */}
            {attachments.length === 4 && (
                <div className='grid grid-cols-2 gap-2 my-2'>
                    <Image
                        src={attachments[0].url}
                        alt={attachments[0].name}
                        width={996}
                        height={747}
                        className='rounded-lg w-full h-[380px] object-cover'
                    />
                    <Image
                        src={attachments[1].url}
                        alt={attachments[1].name}
                        width={1060}
                        height={706}
                        className='rounded-lg w-full h-[380px] object-cover'
                    />
                    <Image
                        src={attachments[2].url}
                        alt={attachments[2].name}
                        width={740}
                        height={1109}
                        className='rounded-lg w-full h-[380px] object-cover'
                    />
                    <Image
                        src={attachments[3].url}
                        alt={attachments[3].name}
                        width={1380}
                        height={776}
                        className='rounded-lg w-full h-[380px] object-cover'
                    />
                </div>
            )}

            {/* Five or More Attachments (Your Original Design Adapted) */}
            {attachments.length >= 5 && (
                <div className='grid grid-cols-3 gap-2 my-2'>
                    <div className='space-y-2'>
                        <div className='grid grid-cols-2 gap-2'>
                            <Image
                                src={attachments[0].url}
                                alt={attachments[0].name}
                                width={996}
                                height={747}
                                className='rounded-lg w-full h-[174px] object-cover'
                            />
                            <Image
                                src={attachments[1].url}
                                alt={attachments[1].name}
                                width={1060}
                                height={706}
                                className='rounded-lg w-full h-[174px] object-cover'
                            />
                        </div>
                        <Image
                            src={attachments[2].url}
                            alt={attachments[2].name}
                            width={740}
                            height={1109}
                            className='rounded-lg w-full h-[198px] object-cover'
                        />
                    </div>
                    <Image
                        src={attachments[3].url}
                        alt={attachments[3].name}
                        width={1060}
                        height={706}
                        className='rounded-lg w-full h-[380px] object-cover'
                    />
                    <div className='relative'>
                        <Image
                            src={attachments[4].url}
                            alt={attachments[4].name}
                            width={1380}
                            height={776}
                            className='rounded-lg w-full h-[380px] object-cover'
                        />
                        {attachments.length > 5 && (
                            <div className='absolute bottom-1/4 right-1/3 bg-black/50 rounded-lg flex items-center justify-center px-4 py-2'>
                                <span className='text-white font-semibold text-2xl'>
                                    +{attachments.length - 5} more
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
