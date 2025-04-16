import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import GlobalModal from '../global/GlobalModal';
import GlobalHeader from '../global/GlobalHeader';
import { useGetSingleNoteQuery } from '@/redux/api/notes/notesApi';
import { TNote } from '@/types';
import {
    ArrowLeft,
    BookOpen,
    CalendarIcon,
    CircleDot,
    Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { renderText } from '@/components/lexicalEditor/renderer/renderText';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import { format } from 'date-fns';
import { Button } from '../ui/button';

const ViewNoteModal = () => {
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const id = searchParams.get('detail');
    const router = useRouter();

    const { data, isLoading } = useGetSingleNoteQuery(id as string, {
        skip: !id,
    });

    const note = data?.note as TNote;

    return (
        <GlobalModal
            setOpen={() => router.push('/my-notes')}
            open={mode === 'view' && id !== null}
            fullScreen
            title={
                <GlobalHeader
                    className='border-none'
                    title={
                        <h2 className='flex gap-1 items-center'>
                            <ArrowLeft
                                className='cursor-pointer'
                                size={18}
                                onClick={() => router.back()}
                            />{' '}
                            {note?.title}
                        </h2>
                    }
                    subTitle={
                        <div className='flex gap-4 pt-1 text-dark-gray items-center'>
                            <div className='flex items-center gap-1'>
                                <div className='flex size-3 items-center justify-center rounded-full bg-[#F99D1C]'>
                                    <CircleDot
                                        size={10}
                                        className='text-white'
                                    />
                                </div>
                                <span
                                    className={cn(
                                        'text-xs text-dark-gray capitalize font-medium',
                                    )}
                                >
                                    {note?.purpose?.category}
                                </span>
                            </div>
                            <div
                                className={cn(
                                    'flex items-center gap-1 text-xs font-medium',
                                )}
                            >
                                <CalendarIcon size={14} />
                                <span>
                                    {dayjs(note?.createdAt).format(
                                        'MMM DD, YYYY | hh:mm A',
                                    )}
                                </span>
                            </div>
                            <div
                                className={cn(
                                    'text-xs flex items-center gap-1 font-medium',
                                )}
                            >
                                <BookOpen size={14} />
                                <span className='capitalize'>
                                    {note?.purpose?.category}
                                </span>
                                :<span>{note?.purpose?.category}</span>
                            </div>
                        </div>
                    }
                />
            }
        >
            <div className='flex-1 overflow-y-auto p-4 document-container w-full bg-background my-3 rounded-lg'>
                {note && (
                    <ScrollArea className='flex-1 pr-4 overflow-auto h-full'>
                        <div className='space-y-3'>
                            {/* Thumbnail */}
                            {note.thumbnail && (
                                <div className='w-full max-h-72 max-w-96 mx-auto border border-forground-border bg-foreground flex justify-between items-center h-72 relative rounded-lg overflow-hidden'>
                                    <Image
                                        src={
                                            note?.thumbnail ||
                                            '/default_image.png'
                                        }
                                        alt={note.title}
                                        className='w-full h-full object-contain'
                                        height={500}
                                        width={1000}
                                    />
                                </div>
                            )}

                            {/* Tags */}
                            {note.tags.length > 0 && (
                                <div className='flex flex-wrap gap-2'>
                                    {note.tags.map((tag, index) => (
                                        <Badge
                                            key={index}
                                            variant='secondary'
                                            className='bg-foreground border border-forground-border shadow-sm'
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Description */}
                            <Card className='w-full overflow-x-auto'>
                                <CardContent className='pt-6'>
                                    <div className='prose overflow-x-auto max-w-none dark:prose-invert'>
                                        {renderText({
                                            text: note?.description,
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Metadata */}
                            <Card>
                                <CardContent className='pt-6'>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div>
                                            <h3 className='text-sm font-medium text-muted-foreground'>
                                                Purpose
                                            </h3>
                                            <p className='mt-1'>
                                                {note.purpose?.category} -{' '}
                                                {note.purpose?.resourceId}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className='text-sm font-medium text-muted-foreground'>
                                                Created
                                            </h3>
                                            <p className='mt-1'>
                                                {format(
                                                    new Date(note.createdAt),
                                                    'PPP p',
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className='text-sm font-medium text-muted-foreground'>
                                                Updated
                                            </h3>
                                            <p className='mt-1'>
                                                {format(
                                                    new Date(note.updatedAt),
                                                    'PPP p',
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className='text-sm font-medium text-muted-foreground'>
                                                IDs
                                            </h3>
                                            <p className='mt-1 text-xs truncate'>
                                                User: {note.user}
                                            </p>
                                            <p className='mt-1 text-xs truncate'>
                                                Branch: {note.branch}
                                            </p>
                                            <p className='mt-1 text-xs truncate'>
                                                Enrollment: {note.enrollment}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Attachments */}
                            {note.attachments &&
                                note.attachments.length > 0 && (
                                    <div className='space-y-4'>
                                        <h3 className='text-lg font-medium'>
                                            Attachments (
                                            {note.attachments.length})
                                        </h3>
                                        <div className='grid grid-cols-1 gap-2'>
                                            {note.attachments.map(
                                                (attachment, index) => (
                                                    <Card
                                                        key={index}
                                                        className='overflow-hidden'
                                                    >
                                                        <div className='p-4 flex items-center justify-between'>
                                                            <div className='flex items-center gap-3'>
                                                                {/* {getFileIcon(attachment.type)} */}
                                                                <div>
                                                                    <p className='font-medium'>
                                                                        {
                                                                            attachment.name
                                                                        }
                                                                    </p>
                                                                    {/* <p className="text-sm text-muted-foreground">{formatFileSize(attachment.size)}</p> */}
                                                                </div>
                                                            </div>
                                                            <div className='flex gap-2'>
                                                                <a
                                                                    href={
                                                                        attachment.url
                                                                    }
                                                                    download={
                                                                        attachment.name
                                                                    }
                                                                >
                                                                    <Button
                                                                        variant='outline'
                                                                        size='sm'
                                                                        asChild
                                                                    >
                                                                        <Download className='h-4 w-4 mr-1' />
                                                                        Download
                                                                    </Button>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </GlobalModal>
    );
};

export default ViewNoteModal;
