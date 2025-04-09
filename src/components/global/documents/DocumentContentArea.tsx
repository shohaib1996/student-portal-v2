'use client';

import { FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlobalDetailsBanner } from '@/components/global/documents/GlobalDetailsBanner';
import { GlobalAttachedFilesSection } from '@/components/global/GlobalAttachedFilesSection';
import { GlobalCommentsSection } from '@/components/global/GlobalCommentSection';
import { DocumentContent } from '@/app/(authenticated)/(documents)/documents-and-labs/_components/document-details-modal';

interface DocumentContentAreaProps {
    document: DocumentContent;
    documentId?: string | null;
    onCommentSubmit?: (content: string) => void;
}

export function DocumentContentArea({
    document,
    documentId,
    onCommentSubmit,
}: DocumentContentAreaProps) {
    return (
        <div className='lg:col-span-2'>
            <GlobalDetailsBanner
                title={document.title}
                author={document.author || (document?.user as string)}
                uploadDate={document.uploadDate}
                lastUpdate={document.lastUpdate}
                tags={document.tags}
                imageUrl={document?.thumbnail || '/default_image.png'}
            />
            <div className=''>
                <Tabs defaultValue='documents'>
                    <TabsList className='bg-background'>
                        <TabsTrigger
                            value='documents'
                            className='gap-2 data-[state=active]:bg-primary'
                        >
                            <FileText className='h-4 w-4' />
                            Documents
                        </TabsTrigger>
                        <TabsTrigger
                            value='slide'
                            className='gap-2 data-[state=active]:bg-primary'
                        >
                            <FileText className='h-4 w-4' />
                            Slide
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value='documents' className='p-0'>
                        <div className='pt-2'>{document.content}</div>

                        <GlobalAttachedFilesSection
                            files={document.attachedFiles}
                        />

                        <GlobalCommentsSection
                            documentId={documentId || ''}
                            onCommentSubmit={onCommentSubmit}
                        />
                    </TabsContent>
                    <TabsContent value='slide'>
                        <div className='flex h-40 items-center justify-center rounded-md border border-dashed p-4'>
                            <p className='text-sm text-muted-foreground'>
                                Slide content would appear here
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
