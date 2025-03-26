import { CalendarDays, Eye, Gauge, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TaskModal from './TaskModal';
import { useState } from 'react';
import { StatusBadge } from './status-badge';

export interface Task {
    id: string;
    title: string;
    marks: number;
    deadline: string;
    workshop: string;
    status: TaskStatus;
}

export type TaskStatus = 'not_answered' | 'completed' | 'pending' | 'rejected';

interface TaskCardProps {
    task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'test' | 'result'>('test');

    const handleTestNowClick = () => {
        setModalMode('test');
        setModalOpen(true);
    };

    const handleSeeResultClick = () => {
        setModalMode('result');
        setModalOpen(true);
    };

    const getStatusBadge = (status: TaskStatus) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge
                        variant='outline'
                        className='text-primary border-border-primary-light py-1 px-2 flex items-center gap-1 font-medium text-xs top-2 left-2 z-10 rounded-full'
                    >
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='14'
                            height='14'
                            viewBox='0 0 14 14'
                            fill='none'
                        >
                            <path
                                d='M11.6673 3.5L5.25065 9.91667L2.33398 7'
                                stroke='#0736D1'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                            <path
                                d='M11.6673 3.5L5.25065 9.91667L2.33398 7'
                                stroke='black'
                                strokeOpacity='0.2'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                        </svg>
                        Completed
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge
                        variant='outline'
                        className='text-amber-800 border-border-primary-light py-1 px-2 flex items-center gap-1 font-medium text-xs top-2 left-2 z-10 rounded-full'
                    >
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='18'
                            height='17'
                            viewBox='0 0 18 17'
                            fill='none'
                        >
                            <path
                                d='M15.3252 12.397C15.0483 12.191 14.6568 12.2485 14.4507 12.5254C14.3374 12.6777 14.2162 12.8271 14.0903 12.9695C13.8617 13.2281 13.886 13.6231 14.1446 13.8517C14.2636 13.9568 14.4112 14.0084 14.5583 14.0084C14.7312 14.0084 14.9033 13.9371 15.0268 13.7974C15.1759 13.6288 15.3195 13.4519 15.4536 13.2715C15.6597 12.9946 15.6022 12.603 15.3252 12.397Z'
                                fill='#F59504'
                                stroke='#F59504'
                                strokeWidth='0.6'
                            />
                            <path
                                d='M16.37 9.4656C16.0329 9.39219 15.6997 9.6061 15.6263 9.94335C15.5859 10.1289 15.5371 10.3148 15.4811 10.4959C15.3792 10.8257 15.564 11.1756 15.8938 11.2775C15.9552 11.2965 16.0174 11.3055 16.0785 11.3055C16.3454 11.3055 16.5925 11.1332 16.6754 10.8648C16.7419 10.6499 16.7998 10.4293 16.8477 10.2092C16.9211 9.87198 16.7072 9.53904 16.37 9.4656Z'
                                fill='#F59504'
                                stroke='#F59504'
                                strokeWidth='0.6'
                            />
                            <path
                                d='M12.316 14.3978C12.1501 14.4904 11.9783 14.5769 11.8054 14.655C11.4908 14.7971 11.351 15.1673 11.493 15.4819C11.5974 15.713 11.8249 15.8498 12.063 15.8498C12.149 15.8498 12.2364 15.8319 12.3199 15.7943C12.525 15.7016 12.7287 15.599 12.9254 15.4891C13.2268 15.3209 13.3347 14.9401 13.1664 14.6388C12.9982 14.3374 12.6174 14.2295 12.316 14.3978Z'
                                fill='#F59504'
                                stroke='#F59504'
                                strokeWidth='0.6'
                            />
                            <path
                                d='M8.37528 3.5V8.24113L6.08344 10.5329C5.83938 10.777 5.83938 11.1728 6.08344 11.4168C6.2055 11.5389 6.36541 11.5999 6.52541 11.5999C6.68534 11.5999 6.84531 11.5388 6.96738 11.4168L9.44225 8.94194C9.55944 8.82475 9.62528 8.66575 9.62528 8.5V3.5C9.62528 3.15481 9.34547 2.875 9.00028 2.875C8.65509 2.875 8.37528 3.15481 8.37528 3.5Z'
                                fill='#F59504'
                                stroke='#F59504'
                                strokeWidth='0.6'
                            />
                            <path
                                d='M16.375 1.84375C16.0298 1.84375 15.75 2.12356 15.75 2.46875V4.20425C14.2952 1.92275 11.7547 0.5 9 0.5C6.86312 0.5 4.85416 1.33216 3.34313 2.84313C1.83216 4.35416 1 6.36312 1 8.5C1 10.6369 1.83216 12.6458 3.34313 14.1569C4.85416 15.6678 6.86312 16.5 9 16.5C9.00528 16.5 9.01038 16.4993 9.01562 16.4992C9.02087 16.4993 9.02597 16.5 9.03125 16.5C9.2565 16.5 9.48397 16.4905 9.70741 16.4718C10.0514 16.443 10.3069 16.1408 10.2781 15.7968C10.2492 15.4529 9.94747 15.1973 9.60309 15.2262C9.41422 15.242 9.22184 15.25 9.03125 15.25C9.02597 15.25 9.02087 15.2507 9.01562 15.2508C9.01038 15.2507 9.00528 15.25 9 15.25C5.27803 15.25 2.25 12.222 2.25 8.5C2.25 4.77803 5.27803 1.75 9 1.75C11.3987 1.75 13.6049 3.02853 14.8105 5.0625H13.092C12.7468 5.0625 12.467 5.34231 12.467 5.6875C12.467 6.03269 12.7468 6.3125 13.092 6.3125H15C15.3806 6.3125 15.7367 6.20553 16.0399 6.02022C16.0594 6.00909 16.0782 5.99712 16.096 5.98422C16.64 5.62637 17 5.01084 17 4.3125V2.46875C17 2.12356 16.7202 1.84375 16.375 1.84375Z'
                                fill='#F59504'
                                stroke='#F59504'
                                strokeWidth='0.6'
                            />
                        </svg>
                        Pending
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge
                        variant='outline'
                        className='text-red-800 border-border-primary-light py-1 px-2 flex items-center gap-1 font-medium text-xs top-2 left-2 z-10 rounded-full'
                    >
                        <svg
                            className='w-4 h-4'
                            viewBox='0 0 24 24'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                        >
                            <circle
                                cx='12'
                                cy='12'
                                r='10'
                                stroke='currentColor'
                                strokeWidth='2'
                            />
                            <path
                                d='M15 9L9 15'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                            />
                            <path
                                d='M9 9L15 15'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                            />
                        </svg>
                        Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge
                        variant='outline'
                        className='text-black border-border-primary-light py-1 px-2 flex items-center gap-1 font-medium text-xs top-2 left-2 z-10 rounded-full'
                    >
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='17'
                            viewBox='0 0 16 17'
                            className='text-black'
                        >
                            <path
                                d='M11.9959 8.17477V4.05977C11.9959 3.47977 11.5259 3.00977 10.9459 3.00977H3.05586C2.47586 3.00977 2.00586 3.47977 2.00586 4.05977V10.4548C2.00586 11.0298 2.47586 11.4998 3.05586 11.5048H3.80086L4.60086 12.6448C4.69586 12.7798 4.84586 12.8598 5.01086 12.8598C5.17086 12.8598 5.32586 12.7798 5.41586 12.6498L6.23586 11.5048H8.04586C8.28586 12.9147 9.51586 13.9948 11.0009 13.9948C12.6509 13.9948 13.9959 12.6498 13.9959 10.9998C13.9959 9.69477 13.1609 8.57977 11.9959 8.17477ZM5.97586 10.5048C5.81586 10.5048 5.66086 10.5848 5.57086 10.7148L5.01586 11.4948L4.47086 10.7148C4.37586 10.5848 4.22086 10.5048 4.06086 10.5048H3.05586C3.02586 10.5048 3.00586 10.4798 3.00586 10.4548V4.05977C3.00586 4.02977 3.02586 4.00977 3.05586 4.00977H10.9459C10.9759 4.00977 10.9959 4.02977 10.9959 4.05977V7.99977C9.51086 7.99977 8.28086 9.08477 8.04586 10.5048H5.97586ZM11.0009 12.9948C9.89586 12.9948 9.00586 12.1048 9.00086 11.0048V10.9998C9.00086 9.89477 9.89586 8.99977 11.0009 8.99977C12.1009 8.99977 12.9959 9.89477 12.9959 10.9998C12.9959 12.0998 12.1009 12.9948 11.0009 12.9948Z'
                                fill='text-black'
                                stroke='text-black'
                                className='text-black'
                                strokeWidth='0.3'
                            />
                            <path
                                d='M9.50098 6.00781H4.52148C4.24513 6.00781 4.02148 5.78391 4.02148 5.50781C4.02148 5.23171 4.24513 5.00781 4.52148 5.00781H9.50098C9.77733 5.00781 10.001 5.23171 10.001 5.50781C10.001 5.78391 9.77738 6.00781 9.50098 6.00781Z'
                                fill='text-black'
                                stroke='text-black'
                                className='text-black'
                                strokeWidth='0.3'
                            />
                            <path
                                d='M4.51562 7.51467C4.23972 7.51467 4.01562 7.29102 4.01562 7.01492C4.01562 6.73882 4.23927 6.51492 4.51512 6.51467L9.49902 6.51172H9.49953C9.77542 6.51172 9.99953 6.73537 9.99953 7.01147C9.99953 7.28757 9.77587 7.51147 9.50002 7.51172L4.51562 7.51467Z'
                                fill='text-black'
                                stroke='text-black'
                                className='text-black'
                                strokeWidth='0.3'
                            />
                            <path
                                d='M4.51563 9.01467C4.23973 9.01467 4.01613 8.79102 4.01563 8.51517C4.01513 8.23907 4.23878 8.01492 4.51513 8.01467L7.49903 8.01172C7.77493 8.01172 7.99903 8.23537 7.99953 8.51122C8.00003 8.78737 7.77638 9.01152 7.50003 9.01177L4.51613 9.01472L4.51563 9.01467Z'
                                fill='text-black'
                                stroke='text-black'
                                className='text-black'
                                strokeWidth='0.3'
                            />
                            <path
                                d='M11.9762 11.2654C12.1712 11.4654 12.1712 11.7804 11.9762 11.9754C11.8812 12.0704 11.7512 12.1204 11.6262 12.1204C11.4962 12.1204 11.3713 12.0704 11.2713 11.9754L11.0012 11.7054L10.7262 11.9804C10.6312 12.0754 10.5012 12.1254 10.3762 12.1254C10.2462 12.1254 10.1213 12.0754 10.0212 11.9804C9.82625 11.7854 9.82625 11.4704 10.0212 11.2704L10.2962 11.0004L10.0212 10.7254C9.82625 10.5304 9.82625 10.2154 10.0212 10.0154C10.2163 9.82039 10.5312 9.82039 10.7262 10.0154L11.0012 10.2904L11.2713 10.0204C11.4662 9.82539 11.7812 9.82539 11.9762 10.0204C12.1712 10.2204 12.1712 10.5354 11.9762 10.7304L11.7112 11.0004L11.9762 11.2654Z'
                                fill='text-black'
                                stroke='text-black'
                                className='text-black'
                                strokeWidth='0.3'
                            />
                        </svg>
                        Not Answer
                    </Badge>
                );
        }
    };

    console.log(task);

    return (
        <>
            <Card className='rounded-lg border border-foreground shadow-none p-2.5 bg-foreground'>
                <div>
                    <div className='flex justify-between gap-4'>
                        <h3 className='flex-1 text-lg font-semibold text-black leading-normal line-clamp-2'>
                            {task.title}
                        </h3>
                        <div className=''>
                            <StatusBadge status={task.status} />
                        </div>
                    </div>

                    <p className='font-medium text-black my-2'>
                        ID:{' '}
                        <span className='text-gray font-normal'>
                            #{task.id}
                        </span>
                    </p>

                    <div className='space-y-1'>
                        <p className='text-xs font-medium text-gray grid grid-cols-3 gap-4'>
                            <span className='flex items-center gap-1'>
                                <Gauge className='h-3.5 w-3.5' />
                                Total Marks:
                            </span>
                            <span className='text-black font-semibold'>
                                {task.marks}
                            </span>
                        </p>
                        <p className='text-xs font-medium text-gray grid grid-cols-3 gap-4'>
                            <span className='flex items-center gap-1'>
                                <CalendarDays className='h-3.5 w-3.5' />
                                Deadline:
                            </span>
                            <span className='text-black font-semibold'>
                                {task.deadline}
                            </span>
                        </p>
                        <p className='text-xs font-medium text-gray grid grid-cols-3 gap-4'>
                            <span className='flex items-center gap-1'>
                                <User className='h-3.5 w-3.5' />
                                Workshop:
                            </span>
                            <span className='text-black font-semibold'>
                                {task.workshop}
                            </span>
                        </p>
                    </div>

                    <div className='border-t border-foreground pt-2 mt-2'>
                        <div className='flex gap-4 justify-between items-center'>
                            <Button
                                variant={
                                    task.status === 'completed' ||
                                    task.status === 'pending' ||
                                    task.status === 'rejected'
                                        ? 'outline'
                                        : 'default'
                                }
                                disabled={
                                    task.status === 'completed' ||
                                    task.status === 'pending' ||
                                    task.status === 'rejected'
                                }
                                onClick={handleTestNowClick}
                                className='hover:bg-primary-light rounded-md px-3.5 py-2.5 h-auto'
                            >
                                Test Now <span className='ml-1'>→</span>
                            </Button>
                            <Button
                                disabled={task.status === 'not_answered'}
                                onClick={handleSeeResultClick}
                                variant='ghost'
                                className='rounded-md px-3.5 py-2 h-auto flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray '
                            >
                                <Eye className='h-5 w-5' />
                                See Result
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
            <TaskModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                mode={modalMode}
                taskData={{
                    id: task.id,
                    title: task.title,
                    marks: task.marks,
                    deadline: 'Mar 20, 2025',
                    workshop: 'Mar 20, 2025',
                }}
            />
        </>
    );
}
