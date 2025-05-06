'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Building } from 'lucide-react';
import GlobalModal from '@/components/global/GlobalModal';
import GlobalComment from '@/components/global/GlobalComments/GlobalComment';
import { formatDateToCustomString } from '@/lib/formatDateToCustomString';
import type { StatusType } from './status-badge';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { instance } from '@/lib/axios/axiosInstance';
import GlobalEditor from '@/components/editor/GlobalEditor';
import UploadAttatchment from '@/components/global/UploadAttatchment/UploadAttatchment';

type TAttatchment = {
    name: string;
    type: string;
    size: number;
    url: string;
};

interface TaskModalProps {
    isOpen: boolean;
    activeTab: 'assignments' | 'tasks' | 'questions';
    onClose: () => void;
    mode: 'test' | 'result';
    taskData: {
        id: string;
        title: string;
        marks: number;
        deadline: string;
        workshop: string;
        status?: StatusType;
        obtainedMark?: number;
        category?: string;
        attachments?: string[];
    };
    handleUpdateDiscussions?: (discussions: any[], id: string) => void;
    update?: (answer: any, id: string) => void;
    handleNext?: (current: number) => void;
    handleprevious?: (current: number) => void;
    current?: number;
    assignments?: any[];
}

export default function TaskModal({
    isOpen,
    onClose,
    mode,
    taskData,
    handleUpdateDiscussions,
    update,
    handleNext,
    handleprevious,
    current = 0,
    assignments = [],
    activeTab,
}: TaskModalProps) {
    const [answerText, setAnswerText] = useState('');
    const [comment, setComment] = useState('');
    const [attachments, setAttachments] = useState<TAttatchment[]>([]);

    // Load answer if available
    useEffect(() => {
        if (taskData && taskData.status) {
            setAnswerText(
                taskData.status === 'not_answered' ? '' : taskData.status,
            );
        } else {
            setAnswerText('');
        }

        // Convert string array to TAttatchment array
        if (
            taskData &&
            taskData.attachments &&
            taskData.attachments.length > 0
        ) {
            const formattedAttachments = taskData.attachments.map((url) => {
                const fileName = url
                    .substring(url.lastIndexOf('/') + 1)
                    .replace(/^\d+-/, '');
                const fileType = getFileTypeFromUrl(url);
                return {
                    name: fileName,
                    type: fileType,
                    size: 0, // We don't have size information from the URL
                    url: url,
                };
            });
            setAttachments(formattedAttachments);
        } else {
            setAttachments([]);
        }
    }, [taskData]);

    // Helper function to determine file type from URL
    const getFileTypeFromUrl = (url: string): string => {
        const extension = url.split('.').pop()?.toLowerCase() || '';
        if (['jpg', 'jpeg', 'png'].includes(extension)) {
            return `image/${extension}`;
        } else if (extension === 'pdf') {
            return 'application/pdf';
        } else if (['doc', 'docx'].includes(extension)) {
            return 'application/msword';
        }
        return 'application/octet-stream';
    };

    console.log({ id: taskData?.id, taskData });
    const handleSubmit = () => {
        const data = {
            answer: answerText,
            attachments: attachments.map((attachment) => attachment.url),
            assignment: taskData?.id,
        };

        instance
            .post('/assignment/submitanswer', data)
            .then((res) => {
                toast.success('Updated');
                if (update) {
                    update(res.data.answer, taskData.id);
                }
                onClose();
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.error || 'Something went wrong',
                );
            });
    };

    const handleComment = () => {
        if (taskData.status === 'not_answered') {
            return toast.error("You haven't answered it yet!");
        }

        if (!comment) {
            return toast.error('Please write something');
        }

        const data = {
            text: comment,
        };

        instance
            .post(`/assignment/reply/${taskData.id}`, data)
            .then((res) => {
                if (handleUpdateDiscussions) {
                    handleUpdateDiscussions(res.data.discussions, taskData.id);
                }
                setComment('');
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.error || 'Something went wrong',
                );
                console.log(err);
            });
    };

    const handleAttachmentsChange = (newAttachments: TAttatchment[]) => {
        setAttachments(newAttachments);
    };

    const isDeadlinePassed = taskData.deadline
        ? dayjs(taskData.deadline).isBefore(dayjs())
        : false;

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
                        <h2 className='font-medium text-lg'>
                            {activeTab === 'tasks'
                                ? 'Technical Task'
                                : activeTab === 'assignments'
                                  ? 'Assignments Test'
                                  : 'Technical Question'}
                        </h2>
                        <p className='text-sm text-gray'>
                            {mode === 'test'
                                ? 'Get Ready to Begin Your Technical Test'
                                : 'View Your Test Results'}
                        </p>
                    </div>
                </div>
            }
            buttons={
                <div className='flex flex-col md:flex-row items-center gap-2'>
                    <Button
                        size='sm'
                        className='gap-1'
                        onClick={() =>
                            handleprevious && handleprevious(current || 0)
                        }
                        disabled={current === 0}
                    >
                        <ChevronLeft className='h-4 w-4' />
                        Prev
                    </Button>

                    {current < assignments.length - 1 && (
                        <Button
                            variant='outline'
                            size='sm'
                            className='gap-1'
                            onClick={() =>
                                handleNext && handleNext(current || 0)
                            }
                        >
                            Next
                            <ChevronRight className='h-4 w-4' />
                        </Button>
                    )}

                    {mode === 'test' ? (
                        <>
                            <Button
                                size='sm'
                                onClick={handleSubmit}
                                disabled={
                                    !answerText.trim() || isDeadlinePassed
                                }
                            >
                                Submit
                                <ChevronRight className='h-4 w-4 ml-1' />
                            </Button>
                        </>
                    ) : (
                        <Button
                            size='sm'
                            onClick={handleSubmit}
                            disabled={
                                taskData.status === 'accepted' ||
                                isDeadlinePassed
                            }
                        >
                            Update
                        </Button>
                    )}
                </div>
            }
        >
            <div className='flex flex-col'>
                {/* Question */}
                <div className='flex justify-between items-center gap-2 mt-2.5 bg-primary-light py-1 px-4 border-l-4 border-l-primary border-primary border rounded-r-md'>
                    <h3 className='text-lg font-medium line-clamp-1'>
                        {taskData.title}
                    </h3>
                    <div className='flex items-center gap-1.5'>
                        {/* <p className='text-nowrap'>ID: #{taskData.id}</p> */}
                        {assignments.length > 0 && (
                            <p className='text-nowrap bg-foreground rounded-full text-base px-2.5 py-1'>
                                {(current || 0) + 1} of {assignments.length}
                            </p>
                        )}
                    </div>
                </div>

                {/* Task Info */}
                <div className=''>
                    <div className='flex items-center gap-2 my-2'>
                        <span className='bg-primary-light text-primary-white border border-primary rounded-full px-2 py-1 text-sm font-medium'>
                            Technical {taskData.category || 'Test'}
                        </span>
                        <span className='bg-amber-200 dark:bg-background rounded-full border border-amber-400 px-2 py-1 text-amber-600 dark:text-white font-medium text-sm'>
                            {taskData.marks} marks
                        </span>
                        {taskData.obtainedMark !== undefined && (
                            <span className='bg-green-200 dark:bg-background rounded-full border border-green-400 px-2 py-1 text-green-600 dark:text-white font-medium text-sm'>
                                Obtained: {taskData.obtainedMark}
                            </span>
                        )}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='flex items-center gap-2 bg-background p-2 rounded-md'>
                            <div className='bg-pink-500/30 p-2 rounded-full'>
                                <Calendar className='h-5 w-5 text-pink-500' />
                            </div>
                            <div>
                                <p className='text-sm text-gray'>Deadline</p>
                                <p className='font-medium'>
                                    {formatDateToCustomString(
                                        taskData.deadline,
                                        false,
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className='flex items-center gap-2 bg-background p-2 rounded-md'>
                            <div className='bg-green-500/30 p-2 rounded-full'>
                                <Building className='h-5 w-5 text-green-500' />
                            </div>
                            <div>
                                <p className='text-sm text-gray'>Workshop</p>
                                <p className='font-medium'>
                                    {formatDateToCustomString(
                                        taskData.workshop,
                                        false,
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className='my-2 bg-background rounded-md px-2.5 py-2'>
                    <div className='flex gap-2'>
                        <div className='mt-1'>
                            <div className='w-4 h-4 rounded-full bg-primary'></div>
                        </div>
                        <div>
                            <h4 className='font-medium'>Description</h4>
                            <p className='text-gray'>{taskData.title}</p>
                        </div>
                    </div>
                </div>

                {/* Answer Section */}
                <div className='flex-1 overflow-auto'>
                    <div className='flex items-center gap-2 mb-1'>
                        <h4 className='font-medium'>Answer</h4>
                        <span className='text-red-500'>*</span>
                    </div>

                    <div className='min-h-[200px] w-full rounded-md border border-border'>
                        <GlobalEditor
                            value={answerText}
                            onChange={setAnswerText}
                            height='200px'
                            placeholder='Write your answer here'
                            className={`${taskData.status === 'accepted' || isDeadlinePassed ? 'pointer-events-none opacity-70' : ''} bg-background`}
                            pluginOptions={{
                                // Main plugin options
                                history: true,
                                autoFocus: true,
                                richText: true,
                                checkList: true,
                                horizontalRule: false,
                                table: false,
                                list: true,
                                tabIndentation: false,
                                draggableBlock: false,
                                images: false,
                                codeHighlight: true,
                                autoLink: false,
                                link: false,
                                componentPicker: true,
                                contextMenu: true,
                                dragDropPaste: true,
                                emojiPicker: true,
                                floatingLinkEditor: true,
                                floatingTextFormat: false,
                                maxIndentLevel: true,
                                beautifulMentions: true,
                                showToolbar: true,
                                showBottomBar: false,
                                quote: false,

                                // Toolbar-specific options
                                toolbar: {
                                    history: false,
                                    blockFormat: false,
                                    codeLanguage: true,
                                    fontFormat: {
                                        bold: true,
                                        italic: true,
                                        underline: true,
                                        strikethrough: true,
                                    },
                                    clearFormatting: true,
                                    horizontalRule: false,
                                    image: false,
                                    table: false,
                                    quote: false,
                                },

                                actionBar: {
                                    maxLength: true,
                                    characterLimit: true,
                                    counter: true,
                                    speechToText: true,
                                    editModeToggle: true,
                                    clearEditor: true,
                                    treeView: true,
                                },
                            }}
                            maxLength={5000}
                        />
                    </div>

                    {isDeadlinePassed && (
                        <div className='mt-2 p-2 bg-red-500/10 border border-danger rounded-md text-danger text-sm'>
                            Due date (
                            {dayjs(taskData.deadline).format('DD MMM YYYY')})
                            expired
                        </div>
                    )}

                    {taskData.status === 'accepted' && (
                        <div className='mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm'>
                            This answer is already accepted
                        </div>
                    )}
                </div>

                {/* Attached Files - Using UploadAttachment component */}
                <div className='mt-2 bg-background rounded-md'>
                    <h4 className='font-medium border-b border-forground-border p-1 px-2'>
                        Attached Files{' '}
                        {attachments.length > 0 && `(${attachments.length})`}
                    </h4>

                    <div
                        className={
                            taskData.status === 'accepted' || isDeadlinePassed
                                ? 'opacity-50 pointer-events-none p-2 pt-0'
                                : ' p-2 pt-0'
                        }
                    >
                        <UploadAttatchment
                            attachments={attachments}
                            onChange={handleAttachmentsChange}
                        />
                    </div>
                </div>

                <GlobalComment contentId={taskData?.id} />
            </div>
        </GlobalModal>
    );
}
