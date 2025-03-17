'use client';

import { FileText } from 'lucide-react';

export interface AttachedFile {
    id: string;
    name: string;
    type: string;
    size: string;
}

interface GlobalAttachedFilesSectionProps {
    files: AttachedFile[];
}

export function GlobalAttachedFilesSection({
    files,
}: GlobalAttachedFilesSectionProps) {
    return (
        <div className='mt-6 border-t pt-4'>
            <h3 className='mb-3 text-sm font-medium'>
                Attached Files ({files.length})
            </h3>
            <div className='flex flex-wrap gap-4'>
                {files.map((file) => (
                    <div
                        key={file.id}
                        className='bg-background flex items-center gap-2 rounded-md border p-2 text-sm'
                    >
                        <div className='flex h-8 w-8 items-center justify-center rounded bg-muted'>
                            <FileText className='h-4 w-4 text-muted-foreground' />
                        </div>
                        <div>
                            <p className='text-xs font-medium'>{file.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
