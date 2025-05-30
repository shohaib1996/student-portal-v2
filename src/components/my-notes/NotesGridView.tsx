import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import {
    BookOpen,
    CalendarIcon,
    CircleDot,
    FileText,
    PanelLeft,
    Pencil,
    Plus,
    Sparkles,
    Trash,
} from 'lucide-react';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import GlobalHeader from '../global/GlobalHeader';
import MessagePreview from '../lexicalEditor/renderer/MessagePreview';
import { Button } from '../ui/button';
import { TAllContent, TChapter, TContent, TNote } from '@/types';
import LexicalJsonRenderer from '../lexicalEditor/renderer/JsonRenderer';
import { renderText } from '@/components/lexicalEditor/renderer/renderText';
import GlobalDeleteModal from '../global/GlobalDeleteModal';
import { useDeleteNoteMutation } from '@/redux/api/notes/notesApi';
import Link from 'next/link';
import { Card } from '../ui/card';
import NotesSkeleton from './NotesSkeleton';
import { renderPlainText } from '../lexicalEditor/renderer/renderPlainText';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useGetSingleChapterForNoteMutation } from '@/redux/api/course/courseApi';

interface NewTNote extends TNote {
    chapterInfo?: TAllContent | undefined | null; // Replace `any` with the appropriate type if known
}
const NotesGridView = ({
    data,
    isLoading,
    setIsOpen,
}: {
    data: TNote[];
    isLoading: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    const [activeNote, setActiveNote] = useState<NewTNote | null>(null);

    const [newNote, setNewNote] = useState<TNote[]>(data);

    const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();
    const [getChapter, { isLoading: isChapter }] =
        useGetSingleChapterForNoteMutation();

    async function getNoteWithChapterInfo(note: TNote): Promise<NewTNote> {
        if (!note?.purpose?.resourceId) {
            return note;
        }
        try {
            const result = await getChapter(note.purpose.resourceId).unwrap();
            return {
                ...note,
                chapterInfo: result?.chapter,
            };
        } catch (error) {
            console.error('Error fetching chapter info:', error);
            return note;
        }
    }

    useEffect(() => {
        async function fetchNotesWithChapters() {
            const updatedNotes = await Promise.all(
                data.map(getNoteWithChapterInfo),
            );
            setNewNote(updatedNotes);
            if (updatedNotes.length > 0) {
                setActiveNote(updatedNotes[0]);
            }
        }

        if (data && data.length > 0) {
            fetchNotesWithChapters();
        }
    }, [data]);

    return isLoading ? (
        <NotesSkeleton />
    ) : data.length === 0 ? (
        <div className='flex min-h-[70vh] flex-col items-center justify-center p-6'>
            <Card className='flex w-full max-w-lg flex-col items-center justify-center border-dashed border-forground-border bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/35 dark:to-indigo-950/35 p-8 text-center shadow-none'>
                <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-900'>
                    <div className='relative'>
                        <FileText className='h-10 w-10 text-dark' />

                        <div className='absolute -right-1 -top-1 animate-pulse'>
                            <Sparkles className='h-5 w-5 text-purple-500' />
                        </div>
                    </div>
                </div>

                <h3 className='mb-2 text-xl font-medium'>No notes yet</h3>
                <p className='mb-6 text-sm text-muted-foreground'>
                    Create your first note to get started. Your notes will
                    appear here.
                </p>

                <Button
                    onClick={() => setIsOpen(true)}
                    className='group relative overflow-hidden hover:text-pure-white bg-gradient-to-r from-blue-500 to-violet-500 transition-all hover:shadow-md'
                >
                    <span className='relative z-10 flex items-center'>
                        <Plus className='mr-2 h-4 w-4' />
                        Create your first note
                    </span>
                    <span className='absolute inset-0  opacity-0 transition-opacity group-hover:opacity-10'></span>
                </Button>

                <div className='mt-8 grid w-full max-w-xs grid-cols-3 gap-2 opacity-30'>
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className='h-16 rounded-md bg-slate-300 dark:bg-slate-600'
                        ></div>
                    ))}
                </div>
            </Card>
        </div>
    ) : (
        <div className='h-full grid lg:grid-cols-4'>
            <div className='pe-2 overflow-y-auto lg:col-span-1 hidden lg:block h-full border-r border-forground-border'>
                <h2 className='text-black font-semibold border-b border-forground-border mb-2'>
                    All Notes ({data.length})
                </h2>
                <div className='space-y-2 h-[calc(100%-32px)]'>
                    {newNote?.map((note: NewTNote) => (
                        <div
                            key={note._id}
                            onClick={() => setActiveNote(note)}
                            className={cn(
                                'w-full cursor-pointer dark:bg-background dark:border-indigo-300/35 rounded-md p-2 shadow-sm bg-primary-light border border-indigo-300/70',
                                {
                                    'bg-primary dark:bg-primary text-white':
                                        activeNote?._id === note?._id,
                                },
                            )}
                        >
                            <div className='flex items-center justify-between'>
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
                                            {
                                                'text-pure-white':
                                                    activeNote?._id ===
                                                    note?._id,
                                            },
                                        )}
                                    >
                                        {note?.purpose?.category ||
                                            'No category'}
                                    </span>
                                </div>
                                <div
                                    className={cn(
                                        'flex items-center gap-1 text-xs text-dark-gray font-medium',
                                        {
                                            'text-pure-white':
                                                activeNote?._id === note?._id,
                                        },
                                    )}
                                >
                                    <CalendarIcon size={14} />
                                    <span>
                                        {dayjs(note?.createdAt).format(
                                            'MMM DD, YYYY | hh:mm A',
                                        )}
                                    </span>
                                </div>
                            </div>
                            <h1 className='mt-2 text-sm font-semibold'>
                                {note?.title}
                            </h1>
                            <p
                                className={cn(
                                    'mt-2 text-xs font-normal text-dark-gray line-clamp-2',
                                    {
                                        'text-pure-white':
                                            activeNote?._id === note?._id,
                                    },
                                )}
                            >
                                {renderPlainText({
                                    text:
                                        note?.description || 'New conversation',
                                    textSize: 'text-xs',
                                    textColor:
                                        activeNote?._id === note?._id
                                            ? 'text-pure-white'
                                            : 'text-darkg-gray',
                                    // truncate: true,
                                    lineClamp: 2,
                                    width: 'w-full',
                                })}
                            </p>

                            <div
                                className={cn(
                                    'text-xs pt-2 flex items-center gap-1 font-medium text-black',
                                    {
                                        'text-pure-white':
                                            activeNote?._id === note?._id,
                                    },
                                )}
                            >
                                <BookOpen size={14} />
                                <span className='capitalize'>
                                    {note.purpose?.category}
                                </span>
                                :
                                <span>
                                    {note.chapterInfo?.lesson?.title ||
                                        note.chapterInfo?.chapter?.name ||
                                        'No Leson or Chaper Seleced'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className='ps-2 lg:col-span-3 col-span-4 h-full overflow-y-auto'>
                <GlobalHeader
                    withTooltip={false}
                    title={activeNote?.title}
                    subTitle={
                        <div className='flex gap-4 pt-1 text-dark-gray items-center'>
                            {activeNote?.purpose && (
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
                                        {activeNote?.purpose?.category}
                                    </span>
                                </div>
                            )}
                            <div
                                className={cn(
                                    'flex items-center gap-1 text-xs font-medium',
                                )}
                            >
                                <CalendarIcon size={14} />
                                <span>
                                    {dayjs(activeNote?.createdAt).format(
                                        'MMM DD, YYYY | hh:mm A',
                                    )}
                                </span>
                            </div>
                            {activeNote?.purpose && (
                                <div
                                    className={cn(
                                        'text-xs flex items-center gap-1 font-medium',
                                    )}
                                >
                                    <BookOpen size={14} />
                                    <span className='capitalize'>
                                        {activeNote?.purpose?.category}
                                    </span>
                                    :
                                    <span>
                                        {' '}
                                        {activeNote.chapterInfo?.lesson
                                            ?.title ||
                                            activeNote.chapterInfo?.chapter
                                                ?.name ||
                                            'No Leson or Chaper Seleced'}
                                    </span>
                                </div>
                            )}
                        </div>
                    }
                    buttons={
                        <div className='flex items-center gap-2'>
                            <Link
                                href={`/my-notes?mode=edit&detail=${activeNote?._id}`}
                            >
                                <Button
                                    className='h-8'
                                    variant={'primary_light'}
                                    icon={<Pencil size={16} />}
                                >
                                    Edit
                                </Button>
                            </Link>
                            <GlobalDeleteModal
                                modalSubTitle='This action cannot be undone. This will permanently delete your note and remove your data from our servers.'
                                loading={isDeleting}
                                deleteFun={deleteNote}
                                _id={activeNote?._id as string}
                            >
                                <Button
                                    className='h-8'
                                    variant={'danger_light'}
                                    icon={<Trash size={16} />}
                                >
                                    Delete
                                </Button>
                            </GlobalDeleteModal>
                        </div>
                    }
                />

                <SheetContent className='lg:hidden p-2 pt-4'>
                    <div className='pe-2 border-r h-full border-forground-border'>
                        <h2 className='text-black font-semibold border-b border-forground-border mb-2'>
                            All Notes ({data.length})
                        </h2>
                        <div className='space-y-2 overflow-y-auto h-[calc(100vh-280px)]'>
                            {data.map((note) => (
                                <div
                                    key={note._id}
                                    onClick={() => setActiveNote(note)}
                                    className={cn(
                                        'w-full cursor-pointer dark:bg-background dark:border-indigo-300/35 rounded-md p-2 shadow-sm bg-primary-light border border-indigo-300/70',
                                        {
                                            'bg-primary dark:bg-primary text-white':
                                                activeNote?._id === note?._id,
                                        },
                                    )}
                                >
                                    <div className='flex items-center justify-between'>
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
                                                    {
                                                        'text-pure-white':
                                                            activeNote?._id ===
                                                            note?._id,
                                                    },
                                                )}
                                            >
                                                {note?.purpose?.category}
                                            </span>
                                        </div>
                                        <div
                                            className={cn(
                                                'flex items-center gap-1 text-xs text-dark-gray font-medium',
                                                {
                                                    'text-pure-white':
                                                        activeNote?._id ===
                                                        note?._id,
                                                },
                                            )}
                                        >
                                            <CalendarIcon size={14} />
                                            <span>
                                                {dayjs(note?.createdAt).format(
                                                    'MMM DD, YYYY | hh:mm A',
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <h1 className='mt-2 text-sm font-semibold'>
                                        {note?.title}
                                    </h1>
                                    <p
                                        className={cn(
                                            'mt-2 text-xs font-normal text-dark-gray line-clamp-2',
                                            {
                                                'text-pure-white':
                                                    activeNote?._id ===
                                                    note?._id,
                                            },
                                        )}
                                    >
                                        {renderPlainText({
                                            text: note?.description || '',
                                            textSize: 'text-xs',
                                            textColor:
                                                activeNote?._id === note?._id
                                                    ? 'text-pure-white'
                                                    : 'text-darkg-gray',
                                            // truncate: true,
                                            lineClamp: 2,
                                            width: 'w-full',
                                        })}
                                    </p>

                                    <div
                                        className={cn(
                                            'text-xs pt-2 flex items-center gap-1 font-medium text-black',
                                            {
                                                'text-pure-white':
                                                    activeNote?._id ===
                                                    note?._id,
                                            },
                                        )}
                                    >
                                        <BookOpen size={14} />
                                        <span className='capitalize'>
                                            {note.purpose?.category}
                                        </span>
                                        :<span>{note.purpose?.category}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SheetContent>

                <div className='pt-2 text-dark-gray'>
                    {renderText({ text: activeNote?.description || '' })}
                </div>
            </div>
        </div>
    );
};

export default NotesGridView;
