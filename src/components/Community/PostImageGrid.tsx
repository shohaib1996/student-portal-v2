'use client';

import { useState } from 'react';
import Image from 'next/image';
import FileCard from '../chat/FileCard';
// Adjust import path as needed

interface Attachment {
    _id: string;
    url: string;
    name: string;
    size?: number;
    createdAt?: string;
    type?: string;
}

interface Post {
    attachments: Attachment[];
}

export default function PostImageGrid({ post }: { post: Post }) {
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<Attachment | null>(null);

    const attachments = post?.attachments || [];

    const handleImageClick = (attachment: Attachment) => {
        // Ensure the attachment has type set for FileCard
        const fileObject = {
            ...attachment,
            type: attachment.type || 'image/jpeg', // Default type if not provided
        };

        setSelectedImage(fileObject);
        setViewerOpen(true);
    };

    return (
        <>
            {/* Single Attachment */}
            {attachments.length === 1 && (
                <div
                    className='my-2 cursor-pointer'
                    onClick={() => handleImageClick(attachments[0])}
                >
                    <Image
                        src={attachments[0].url}
                        alt={attachments[0].name}
                        width={996}
                        height={747}
                        className='rounded-lg w-full h-[380px] object-cover transition-transform duration-300 hover:scale-[0.99] hover:brightness-95'
                    />
                </div>
            )}

            {/* Two Attachments */}
            {attachments.length === 2 && (
                <div className='grid grid-cols-2 gap-2 my-2'>
                    <div
                        className='cursor-pointer'
                        onClick={() => handleImageClick(attachments[0])}
                    >
                        <Image
                            src={attachments[0].url}
                            alt={attachments[0].name}
                            width={996}
                            height={747}
                            className='rounded-lg w-full h-[380px] object-cover transition-transform duration-300 hover:scale-[0.98] hover:brightness-95'
                        />
                    </div>
                    <div
                        className='cursor-pointer'
                        onClick={() => handleImageClick(attachments[1])}
                    >
                        <Image
                            src={attachments[1].url}
                            alt={attachments[1].name}
                            width={1060}
                            height={706}
                            className='rounded-lg w-full h-[380px] object-cover transition-transform duration-300 hover:scale-[0.98] hover:brightness-95'
                        />
                    </div>
                </div>
            )}

            {/* Three Attachments */}
            {attachments.length === 3 && (
                <div className='grid grid-cols-3 gap-2 my-2'>
                    <div
                        className='cursor-pointer'
                        onClick={() => handleImageClick(attachments[0])}
                    >
                        <Image
                            src={attachments[0].url}
                            alt={attachments[0].name}
                            width={996}
                            height={747}
                            className='rounded-lg w-full h-[380px] object-cover transition-transform duration-300 hover:scale-[0.98] hover:brightness-95'
                        />
                    </div>
                    <div
                        className='cursor-pointer'
                        onClick={() => handleImageClick(attachments[1])}
                    >
                        <Image
                            src={attachments[1].url}
                            alt={attachments[1].name}
                            width={1060}
                            height={706}
                            className='rounded-lg w-full h-[380px] object-cover transition-transform duration-300 hover:scale-[0.98] hover:brightness-95'
                        />
                    </div>
                    <div
                        className='cursor-pointer'
                        onClick={() => handleImageClick(attachments[2])}
                    >
                        <Image
                            src={attachments[2].url}
                            alt={attachments[2].name}
                            width={740}
                            height={1109}
                            className='rounded-lg w-full h-[380px] object-cover transition-transform duration-300 hover:scale-[0.98] hover:brightness-95'
                        />
                    </div>
                </div>
            )}

            {/* Four Attachments */}
            {attachments.length === 4 && (
                <div className='grid grid-cols-2 gap-2 my-2'>
                    <div
                        className='cursor-pointer'
                        onClick={() => handleImageClick(attachments[0])}
                    >
                        <Image
                            src={attachments[0].url}
                            alt={attachments[0].name}
                            width={996}
                            height={747}
                            className='rounded-lg w-full h-[380px] object-cover transition-transform duration-300 hover:scale-[0.98] hover:brightness-95'
                        />
                    </div>
                    <div
                        className='cursor-pointer'
                        onClick={() => handleImageClick(attachments[1])}
                    >
                        <Image
                            src={attachments[1].url}
                            alt={attachments[1].name}
                            width={1060}
                            height={706}
                            className='rounded-lg w-full h-[380px] object-cover transition-transform duration-300 hover:scale-[0.98] hover:brightness-95'
                        />
                    </div>
                    <div
                        className='cursor-pointer'
                        onClick={() => handleImageClick(attachments[2])}
                    >
                        <Image
                            src={attachments[2].url}
                            alt={attachments[2].name}
                            width={740}
                            height={1109}
                            className='rounded-lg w-full h-[380px] object-cover transition-transform duration-300 hover:scale-[0.98] hover:brightness-95'
                        />
                    </div>
                    <div
                        className='cursor-pointer'
                        onClick={() => handleImageClick(attachments[3])}
                    >
                        <Image
                            src={attachments[3].url}
                            alt={attachments[3].name}
                            width={1380}
                            height={776}
                            className='rounded-lg w-full h-[380px] object-cover transition-transform duration-300 hover:scale-[0.98] hover:brightness-95'
                        />
                    </div>
                </div>
            )}

            {/* Five or More Attachments */}
            {attachments.length >= 5 && (
                <div className='grid grid-cols-3 gap-2 my-2'>
                    <div className='space-y-2'>
                        <div className='grid grid-cols-2 gap-2'>
                            <div
                                className='cursor-pointer'
                                onClick={() => handleImageClick(attachments[0])}
                            >
                                <Image
                                    src={attachments[0].url}
                                    alt={attachments[0].name}
                                    width={996}
                                    height={747}
                                    className='rounded-lg w-full h-[174px] object-cover transition-transform duration-300 hover:scale-[0.98] hover:brightness-95'
                                />
                            </div>
                            <div
                                className='cursor-pointer'
                                onClick={() => handleImageClick(attachments[1])}
                            >
                                <Image
                                    src={attachments[1].url}
                                    alt={attachments[1].name}
                                    width={1060}
                                    height={706}
                                    className='rounded-lg w-full h-[174px] object-cover transition-transform duration-300 hover:scale-[0.98] hover:brightness-95'
                                />
                            </div>
                        </div>
                        <div
                            className='cursor-pointer'
                            onClick={() => handleImageClick(attachments[2])}
                        >
                            <Image
                                src={attachments[2].url}
                                alt={attachments[2].name}
                                width={740}
                                height={1109}
                                className='rounded-lg w-full h-[198px] object-cover transition-transform duration-300 hover:scale-[0.98] hover:brightness-95'
                            />
                        </div>
                    </div>
                    <div
                        className='cursor-pointer'
                        onClick={() => handleImageClick(attachments[3])}
                    >
                        <Image
                            src={attachments[3].url}
                            alt={attachments[3].name}
                            width={1060}
                            height={706}
                            className='rounded-lg w-full h-[380px] object-cover transition-transform duration-300 hover:scale-[0.98] hover:brightness-95'
                        />
                    </div>
                    <div
                        className='relative cursor-pointer'
                        onClick={() => handleImageClick(attachments[4])}
                    >
                        <Image
                            src={attachments[4].url}
                            alt={attachments[4].name}
                            width={1380}
                            height={776}
                            className='rounded-lg w-full h-[380px] object-cover transition-transform duration-300 hover:scale-[0.98] hover:brightness-95'
                        />
                        {attachments.length > 5 && (
                            <div className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg'>
                                <span className='text-white font-semibold text-2xl'>
                                    +{attachments.length - 5} more
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Image Viewer Modal using FileCard */}
            {viewerOpen && selectedImage && (
                <div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-pure-black/80'
                    onClick={() => setViewerOpen(false)}
                >
                    <div
                        className='relative max-w-full lg:max-w-[80vw] max-h-full lg:max-h-[95vh]'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FileCard
                            file={selectedImage}
                            key={selectedImage._id}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
