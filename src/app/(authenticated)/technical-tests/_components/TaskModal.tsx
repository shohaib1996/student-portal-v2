'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    X,
    ChevronLeft,
    ChevronRight,
    Paperclip,
    Send,
    ImageIcon,
} from 'lucide-react';
import GlobalModal from '@/components/global/GlobalModal';
import { GlobalCommentsSection } from '@/components/global/GlobalCommentSection';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'test' | 'result';
    taskData: {
        id: string;
        title: string;
        marks: number;
        deadline: string;
        workshop: string;
    };
}

export default function TaskModal({
    isOpen,
    onClose,
    mode,
    taskData,
}: TaskModalProps) {
    const [currentQuestion, setCurrentQuestion] = useState(1);
    const totalQuestions = 50;
    const [isEditing, setIsEditing] = useState(false);
    const [answerText, setAnswerText] = useState(
        'Bootcamps Hub is an all-in-one SaaS platform designed for high-ticket coaches and educators.',
    );

    const handleUpdateClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
    };

    const handleSubmitClick = () => {
        // Here you would typically save the changes
        setIsEditing(false);
    };

    return (
        <GlobalModal
            open={isOpen}
            setOpen={(open) => !open && onClose()}
            title={
                <div className='flex items-center gap-2'>
                    <button
                        onClick={onClose}
                        className='p-1 hover:bg-background rounded-full'
                    >
                        <ChevronLeft className='h-5 w-5' />
                    </button>
                    <div>
                        <h2 className='font-medium text-lg'>Technical Test</h2>
                        <p className='text-sm text-gray'>
                            {mode === 'test'
                                ? 'Course Payment Invoice'
                                : 'Get Ready to Begin Your Technical Test'}
                        </p>
                    </div>
                </div>
            }
            buttons={
                <div className='flex flex-col md:flex-row items-center gap-2'>
                    <Button size='sm' className='gap-1'>
                        <ChevronLeft className='h-4 w-4' />
                        Previous
                    </Button>

                    <Button variant='outline' size='sm' className='gap-1'>
                        Next
                        <ChevronRight className='h-4 w-4' />
                    </Button>

                    {mode === 'test' ? (
                        <>
                            <Button variant='outline' size='sm'>
                                Cancel
                            </Button>
                            <Button size='sm'>
                                Submit
                                <ChevronRight className='h-4 w-4 ml-1' />
                            </Button>
                        </>
                    ) : (
                        <>
                            {isEditing ? (
                                <>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={handleCancelClick}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size='sm'
                                        onClick={handleSubmitClick}
                                    >
                                        Submit
                                        <ChevronRight className='h-4 w-4 ml-1' />
                                    </Button>
                                </>
                            ) : (
                                <Button size='sm' onClick={handleUpdateClick}>
                                    Update
                                </Button>
                            )}
                        </>
                    )}
                </div>
            }
        >
            <div className='flex flex-col'>
                {/* Question */}
                <div className='flex justify-between items-center gap-2 mt-2.5 bg-primary-light py-1 px-4 border-l-4 border-l-primary-white border-primary-white border rounded-r-md'>
                    <h3 className='text-lg font-medium line-clamp-1'>
                        How does using object-fit enhance the responsiveness of
                        images in a design?
                    </h3>
                    <div className='flex items-center gap-1.5'>
                        <p className='text-nowrap'>ID: #{taskData.id}</p>
                        <p className='text-nowrap bg-foreground rounded-full text-base px-2.5 py-1'>
                            {currentQuestion} of {totalQuestions}
                        </p>
                    </div>
                </div>

                {/* Task Info */}
                <div className=''>
                    <div className='flex items-center gap-2 my-2'>
                        <span className='bg-primary-light text-primary-white border border-primary-white rounded-full px-2 py-1 text-sm font-medium'>
                            Technical Test
                        </span>
                        <span className='bg-amber-200 dark:bg-background rounded-full border border-amber-400 px-2 py-1 text-amber-600 dark:text-white font-medium text-sm'>
                            {taskData.marks} marks
                        </span>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='flex items-center gap-2 border-dashed border border-gray-200 p-2 rounded-md'>
                            <div className='bg-pink-100 dark:bg-background p-2 rounded-full'>
                                <svg
                                    className='w-5 h-5 text-pink-500'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className='text-sm text-gray'>Deadline</p>
                                <p className='font-medium'>
                                    {taskData.deadline}
                                </p>
                            </div>
                        </div>

                        <div className='flex items-center gap-2 border-dashed border border-gray-200 p-2 rounded-md'>
                            <div className='bg-green-100 dark:bg-background p-2 rounded-full'>
                                <svg
                                    className='w-5 h-5 text-green-500'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className='text-sm text-gray'>Workshop</p>
                                <p className='font-medium'>
                                    {taskData.workshop}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className='my-2 bg-foreground px-2.5 py-2'>
                    <div className='flex gap-2'>
                        <div className='mt-1'>
                            <div className='w-4 h-4 rounded-full bg-primary'></div>
                        </div>
                        <div>
                            <h4 className='font-medium'>Description</h4>
                            <p className='text-gray'>
                                Bootcamps Hub is an all-in-one SaaS platform
                                designed for high-ticket coaches and educators.
                                It empowers you to launch, manage, and scale
                                premium boot camps without relying on fragmented
                                tools like Udemy or Skillshare.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Answer Section */}
                <div className='flex-1 overflow-auto'>
                    <div className='flex items-center gap-2 mb-1'>
                        <h4 className='font-medium'>Answer</h4>
                        <span className='text-red-500'>*</span>
                    </div>

                    {mode === 'test' || (mode === 'result' && isEditing) ? (
                        <Textarea
                            placeholder='Write here'
                            className='min-h-[200px] w-full p-3 border-border bg-background focus-visible:ring-0 rounded-md'
                            value={mode === 'result' ? answerText : ''}
                            onChange={(e) => setAnswerText(e.target.value)}
                        />
                    ) : (
                        <div className='min-h-[200px] w-full p-3 border rounded-md bg-white'>
                            {answerText}
                        </div>
                    )}
                </div>

                {/* Attached Files */}
                <div className='mt-2 border border-foreground rounded-md'>
                    <h4 className='font-medium border-b border-foreground p-1'>
                        Attached Files {mode === 'result' && '(1)'}
                    </h4>

                    <div className='flex items-center gap-2 p-1'>
                        <Button variant='outline' size='sm' className='p-2'>
                            <Paperclip className='h-4 w-4' />
                            Attach or drag & drop
                            <span className='text-xs text-gray hidden md:block'>
                                JPG, PNG, PDF, DOCS, Max 10MB
                            </span>
                        </Button>
                    </div>

                    {mode === 'result' && (
                        <div className='flex items-center gap-2 p-2 border rounded-md bg-gray-50'>
                            <div className='bg-gray-200 p-2 rounded'>
                                <ImageIcon className='h-4 w-4 text-gray' />
                            </div>
                            <span className='text-sm'>
                                Group - image 2025-03...
                            </span>
                            <span className='text-xs text-gray'>123 KB</span>
                            <button className='ml-auto text-red-500'>
                                <X className='h-4 w-4' />
                            </button>
                        </div>
                    )}
                </div>

                {/* Comments or Report Issue */}
                <div className='mt-2'>
                    <div className='mb-0'>Report an issue</div>
                    <GlobalCommentsSection />
                </div>
            </div>
        </GlobalModal>
    );
}
