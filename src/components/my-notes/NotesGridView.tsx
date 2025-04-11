import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import { BookOpen, CalendarIcon, CircleDot, Pencil, Trash } from 'lucide-react';
import React, { useState } from 'react';
import GlobalHeader from '../global/GlobalHeader';
import MessagePreview from '../chat/Message/MessagePreview';
import { Button } from '../ui/button';
import { TNote } from '@/types';

const text = '';

const NotesGridView = ({
    data,
    isLoading,
}: {
    data: TNote[];
    isLoading: boolean;
}) => {
    const [activeNote, setActiveNote] = useState<TNote>(data[0]);

    return (
        <div className='flex h-full'>
            <div className='w-1/4 pe-2 h-full border-r border-forground-border'>
                <h2 className='text-black font-semibold border-b border-forground-border mb-2'>
                    All Notes ({data.length})
                </h2>
                <div className='space-y-2 overflow-y-auto h-[calc(100%-32px)]'>
                    {isLoading
                        ? Array.from({ length: 10 }, (_, i) => (
                              <div key={i}></div>
                          ))
                        : data.map((note) => (
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
                                                  activeNote?._id === note?._id,
                                          },
                                      )}
                                  >
                                      {note?.description}
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
                                      :<span>{note.purpose?.category}</span>
                                  </div>
                              </div>
                          ))}
                </div>
            </div>
            <div className='w-3/4 ps-2 h-full'>
                <GlobalHeader
                    title={activeNote?.title}
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
                                    {activeNote?.purpose?.category}
                                </span>
                            </div>
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
                            <div
                                className={cn(
                                    'text-xs flex items-center gap-1 font-medium',
                                )}
                            >
                                <BookOpen size={14} />
                                <span className='capitalize'>
                                    {activeNote?.purpose?.category}
                                </span>
                                :<span>{activeNote?.purpose?.category}</span>
                            </div>
                        </div>
                    }
                    buttons={
                        <div className='flex items-center gap-2'>
                            <Button
                                className='h-8'
                                variant={'primary_light'}
                                icon={<Pencil size={16} />}
                            >
                                Edit
                            </Button>
                            <Button
                                className='h-8'
                                variant={'danger_light'}
                                icon={<Trash size={16} />}
                            >
                                Delete
                            </Button>
                        </div>
                    }
                />

                <div className='pt-2 text-dark-gray h-[calc(100%-60px)] overflow-y-auto'>
                    <MessagePreview text={activeNote?.description} />
                </div>
            </div>
        </div>
    );
};

export default NotesGridView;
