'use client';

import { FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlobalDetailsBanner } from '@/components/global/documents/GlobalDetailsBanner';
import { GlobalAttachedFilesSection } from '@/components/global/GlobalAttachedFilesSection';
import { GlobalCommentsSection } from '@/components/global/GlobalCommentSection';
import { DocumentContent } from '@/app/(authenticated)/(documents)/documents-and-labs/_components/document-details-modal';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { instance } from '@/lib/axios/axiosInstance';
import parse from 'html-react-parser';
import MessagePreview from '@/components/chat/Message/MessagePreview';
import MessageRenderer from '@/components/lexicalEditor/renderer/MessageRenderer';

interface DocumentContentAreaProps {
    document: DocumentContent;
    documentId?: string | null;
    onCommentSubmit?: (content: string) => void;
    isLab?: boolean;
}

export function DocumentContentArea({
    document,
    documentId,
    onCommentSubmit,
    isLab = false,
}: DocumentContentAreaProps) {
    const router = useRouter();
    const pathName = usePathname();
    const [content, setContent] = useState<{
        _id: string;
        slide: { _id: string; slides: any };
        description?: any;
        tags?: string[];
    }>({ _id: '', slide: { _id: '', slides: [] }, description: '', tags: [] });
    const [slideDocument, setSlideDocument] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const safeParseContent = (content: string) => {
        // Ensure content is a string before parsing
        return typeof content === 'string' ? parse(content) : content;
    };

    useEffect(() => {
        if (documentId) {
            setIsLoading(true);
            instance
                .get(`/content/getcontent/${documentId}`)
                .then((res: any) => {
                    setContent(res.data.content);

                    setIsLoading(false);
                })
                .catch((err: any) => {
                    setIsLoading(false);
                    toast.error(
                        'Content not found or you have no access to it',
                    );
                });
        }
    }, [documentId]);

    const generateSlideDocs = () => {
        if (content?.slide?.slides) {
            let string = '';
            content?.slide?.slides.map((slide: any) => {
                let temp = '';
                if (slide.title) {
                    temp = temp.concat(' ', `<h2>${slide.title}</h2>`);
                }
                temp = temp.concat(' ', slide.content);
                string = string.concat(' ', `<div>${temp}</div>`);
            });

            setSlideDocument(`
            <div>
            ${string}
            </div>
            `);
        }
    };
    console.log({ LabContent: content });
    console.log({ document: document });
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
                        {isLab && (
                            <TabsTrigger
                                value='slide'
                                className='gap-2 data-[state=active]:bg-primary'
                                // onClick={() =>
                                //     router.push(
                                //         `/presentation-slides/subslide/${content?.slide?._id}?content=${content?._id}`,
                                //     )
                                // }
                            >
                                <FileText className='h-4 w-4' />
                                Slide
                            </TabsTrigger>
                        )}
                    </TabsList>
                    <TabsContent value='documents' className='p-0'>
                        {pathName === '/my-templates' && (
                            <div className='flex flex-row items-center gap-2 w-full'>
                                Programs:{' '}
                                <div className='flex flex-row items-center flex-wrap gap-2 w-full'>
                                    {(document?.programs ?? []).map(
                                        (program, i) => (
                                            <p
                                                key={i}
                                                className='bg-background text-xs p-1 px-2 rounded-xl'
                                            >
                                                {program?.title}
                                            </p>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}
                        {pathName === '/my-templates' && (
                            <div className='flex flex-row items-center gap-2 w-full mt-2'>
                                Sessions:{' '}
                                <div className='flex flex-row items-center flex-wrap gap-2 w-full'>
                                    {document?.sessions?.map((session, i) => (
                                        <p
                                            key={i}
                                            className='bg-background text-xs p-1 px-2 rounded-xl'
                                        >
                                            {typeof session === 'object' &&
                                            'name' in session
                                                ? session.name
                                                : String(session)}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className='pt-2'>
                            Description:{' '}
                            <div className='min-h-[100px] rounded-md bg-background px-2 py-1 max-h-[500px] overflow-y-auto'>
                                <MessageRenderer
                                    text={document.content || ''}
                                />
                            </div>
                        </div>

                        <GlobalAttachedFilesSection
                            files={document.attachedFiles}
                        />

                        <GlobalCommentsSection
                            documentId={documentId || ''}
                            onCommentSubmit={onCommentSubmit}
                        />
                    </TabsContent>
                    <TabsContent value='slide'>
                        <div className='flex flex-col h-40 bg-background rounded-md border border-dashed p-2'>
                            {/* ================================== Tags ================================= */}
                            <div className='tags_container flex flex-row flex-wrap items-center gap-2'>
                                <div className='text-lg text-black'>Tags: </div>
                                {(content?.tags ?? []).length > 0 &&
                                    (content?.tags ?? []).map((tag, i) => (
                                        <span
                                            className={`text-xs text-dark-gray bg-foreground rounded-xl p-1`}
                                            key={i}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                            </div>
                            {/* ============================== Content ============================== */}
                            {slideDocument ? (
                                <div
                                    id='content_id'
                                    className={`content_description`}
                                    // style={{ marginTop: "20px" }}
                                >
                                    {safeParseContent(slideDocument)}
                                </div>
                            ) : (
                                <h3 className='text-primary mt-2 mb-2 pb-2'>
                                    {safeParseContent(content?.description)}
                                </h3>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
