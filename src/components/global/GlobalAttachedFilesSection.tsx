'use client';

import { FileText, File, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export interface AttachedFile {
    id: string;
    name: string;
    type: string;
    size: string;
    url?: string; // URL property for the file location
}

interface GlobalAttachedFilesSectionProps {
    files: AttachedFile[];
}

export function GlobalAttachedFilesSection({
    files,
}: GlobalAttachedFilesSectionProps) {
    // Function to determine if file is an image
    const isImageFile = (type: string): boolean => {
        return [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
        ].includes(type);
    };
    // Function to get the appropriate icon based on file type
    const getFileIcon = (type: string) => {
        if (type === 'application/pdf') {
            return <FileText className='h-4 w-4 text-red-500' />;
        } else if (
            type === 'application/msword' ||
            type ===
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
            return <FileText className='h-4 w-4 text-blue-500' />;
        } else if (isImageFile(type) || type === 'image') {
            return <ImageIcon className='h-4 w-4 text-green-500' />;
        } else {
            return <File className='h-4 w-4 text-muted-foreground' />;
        }
    };
    return (
        <div className='mt-6 border-t pt-4'>
            <h3 className='mb-3 text-sm font-medium'>
                Attached Files ({files.length})
            </h3>
            <div className='flex flex-wrap gap-4'>
                {files.map((file) => (
                    <Link
                        key={file?.id}
                        href={file?.url || file?.name || `#file-${file.id}`}
                        target='_blank'
                        download={file?.url || file?.name}
                        rel='noopener noreferrer'
                        className='bg-background flex flex-row gap-1 rounded-md border p-2 text-sm hover:bg-muted transition-colors cursor-pointer'
                    >
                        {isImageFile(file.type) ? (
                            <div className='h-24 w-32 overflow-hidden rounded'>
                                <img
                                    src={file.url || file?.name}
                                    alt={file.name}
                                    className='h-full w-full object-cover'
                                />
                            </div>
                        ) : (
                            <div className='flex h-8 w-8 items-center justify-center rounded bg-muted'>
                                {getFileIcon(file.type)}
                            </div>
                        )}
                        <div className=''>
                            <p className='text-xs font-medium truncate max-w-32'>
                                {file.name || 'undefined'}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                                {file.size || 'undefined'}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
