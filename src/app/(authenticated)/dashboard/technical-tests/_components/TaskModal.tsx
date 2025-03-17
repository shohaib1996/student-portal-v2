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
                        className='p-1 hover:bg-gray-100 rounded-full'
                    >
                        <ChevronLeft className='h-5 w-5' />
                    </button>
                    <div>
                        <h2 className='font-medium text-lg'>Technical Test</h2>
                        <p className='text-sm text-gray-500'>
                            {mode === 'test'
                                ? 'Course Payment Invoice'
                                : 'Get Ready to Begin Your Technical Test'}
                        </p>
                    </div>
                </div>
            }
            buttons={
                <div className='flex items-center gap-2'>
                    <Button variant='outline' size='sm' className='gap-1'>
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
                            <Button
                                size='sm'
                                className='bg-blue-600 hover:bg-blue-700'
                            >
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
                                        className='bg-blue-600 hover:bg-blue-700'
                                        onClick={handleSubmitClick}
                                    >
                                        Submit
                                        <ChevronRight className='h-4 w-4 ml-1' />
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    size='sm'
                                    className='bg-blue-600 hover:bg-blue-700'
                                    onClick={handleUpdateClick}
                                >
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
                <div className='border-l-4 border-blue-600 bg-blue-50 p-4 flex justify-between items-center'>
                    <h3 className='text-lg font-medium'>
                        How does using object-fit enhance the responsiveness of
                        images in a design?
                    </h3>
                    <div className='text-sm text-gray-500 flex'>
                        <span>ID: #{taskData.id}</span>
                        <span className='ml-4'>
                            {currentQuestion} of {totalQuestions}
                        </span>
                    </div>
                </div>

                {/* Task Info */}
                <div className='p-4 border-b'>
                    <div className='flex items-center gap-2 mb-2'>
                        <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium'>
                            Technical Test
                        </span>
                        <span className='text-amber-600 font-medium'>
                            {taskData.marks} marks
                        </span>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div className='flex items-center gap-2'>
                            <div className='bg-pink-100 p-2 rounded-full'>
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
                                <p className='text-sm text-gray-500'>
                                    Deadline
                                </p>
                                <p className='font-medium'>
                                    {taskData.deadline}
                                </p>
                            </div>
                        </div>

                        <div className='flex items-center gap-2'>
                            <div className='bg-green-100 p-2 rounded-full'>
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
                                <p className='text-sm text-gray-500'>
                                    Workshop
                                </p>
                                <p className='font-medium'>
                                    {taskData.workshop}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className='p-4 border-b'>
                    <div className='flex items-center gap-2 mb-2'>
                        <div className='w-4 h-4 rounded-full bg-blue-600'></div>
                        <h4 className='font-medium'>Description</h4>
                    </div>
                    <p className='text-gray-700'>
                        Bootcamps Hub is an all-in-one SaaS platform designed
                        for high-ticket coaches and educators. It empowers you
                        to launch, manage, and scale premium boot camps without
                        relying on fragmented tools like Udemy or Skillshare.
                    </p>
                </div>

                {/* Answer Section */}
                <div className='p-4 border-b flex-1 overflow-auto'>
                    <div className='flex items-center gap-2 mb-2'>
                        <h4 className='font-medium'>Answer</h4>
                        <span className='text-red-500'>*</span>
                    </div>

                    {mode === 'test' || (mode === 'result' && isEditing) ? (
                        <Textarea
                            placeholder='Write here'
                            className='min-h-[200px] w-full p-3 border rounded-md'
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
                <div className='p-4 border-b'>
                    <h4 className='font-medium mb-2'>
                        Attached Files {mode === 'result' && '(1)'}
                    </h4>

                    <div className='flex items-center gap-2 mb-2'>
                        <Button variant='outline' size='sm' className='gap-1'>
                            <Paperclip className='h-4 w-4' />
                            Attach or drag & drop
                            <span className='text-xs text-gray-500'>
                                JPG, PNG, PDF, DOCS, Max 10MB
                            </span>
                        </Button>
                    </div>

                    {mode === 'result' && (
                        <div className='flex items-center gap-2 p-2 border rounded-md bg-gray-50'>
                            <div className='bg-gray-200 p-2 rounded'>
                                <ImageIcon className='h-4 w-4 text-gray-500' />
                            </div>
                            <span className='text-sm'>
                                Group - image 2025-03...
                            </span>
                            <span className='text-xs text-gray-500'>
                                123 KB
                            </span>
                            <button className='ml-auto text-red-500'>
                                <X className='h-4 w-4' />
                            </button>
                        </div>
                    )}
                </div>

                {/* Comments or Report Issue */}
                <div className='p-4 border-b'>
                    <div className='text-sm text-gray-500 text-center py-2'>
                        Comments section will be implemented globally
                    </div>
                </div>
            </div>
        </GlobalModal>
    );
}
