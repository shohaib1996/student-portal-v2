'use client';

import {
    FileText,
    ClipboardList,
    MessageCircleQuestion,
    LayoutGrid,
    List,
    Eye,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskCard from './TaskCard';
import GlobalHeader from '@/components/global/GlobalHeader';
import { Button } from '@/components/ui/button';
import { useGetTechnicalTestsQuery } from '@/redux/api/technicalTest/technicalTest';
import { useState, useEffect } from 'react';
import GlobalPagination from '@/components/global/GlobalPagination';
import TechnicalMetrics from './TechnicalMetrics';
import FilterModal from '@/components/global/FilterModal/FilterModal';
import GlobalTable, {
    TCustomColumnDef,
} from '@/components/global/GlobalTable/GlobalTable';
import TdDate from '@/components/global/TdDate';
import { StatusBadge } from './status-badge';
import TaskModal from './TaskModal';

interface Assignment {
    _id: string;
    attachments: string[];
    groups: {
        activeStatus: { isActive: boolean; activeUntill: string } | null;
        _id: string;
        title: string;
    }[];
    mark: number;
    category: string;
    question: string;
    createdBy: {
        profilePicture: string;
        lastName: string;
        _id: string;
        firstName: string;
        fullName: string;
    };
    id: number;
    workshop: string;
    createdAt: string;
    updatedAt: string;
    dueDate: string | null;
    description?: string;
}

const TechnicalTest = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [type, setType] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [limit, setLimit] = useState(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isGridView, setIsGridView] = useState<boolean>(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'test' | 'result'>('test');
    const [selectedTask, setSelectedTask] = useState<Assignment | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Check for mobile screen size
    useEffect(() => {
        const checkForMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        checkForMobile();

        // Add event listener for window resize
        window.addEventListener('resize', checkForMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkForMobile);
    }, []);

    const { data, isLoading } = useGetTechnicalTestsQuery({
        page: currentPage,
        limit: limit,
        workshop: selectedDate || null,
        category: category,
        query: searchQuery,
        type: type,
        status: '',
    });

    const assignments: Assignment[] = data?.assignments || [];
    const totalItems = assignments.length || 0;
    const totalPages = Math.ceil(totalItems / limit);

    const handleTestNowClick = (task: Assignment) => {
        setModalMode('test');
        setSelectedTask(task);
        setModalOpen(true);
    };

    const handleSeeResultClick = (task: Assignment) => {
        setModalMode('result');
        setSelectedTask(task);
        setModalOpen(true);
    };

    const handlePageChange = (page: number, newLimit?: number) => {
        let newPage = page;

        if (newLimit && newLimit !== limit) {
            // Calculate the new total pages with the new limit
            const newTotalPages = Math.ceil(totalItems / newLimit);
            // Keep the first item of the current page in view
            const currentStartIndex = (currentPage - 1) * limit;
            newPage = Math.floor(currentStartIndex / newLimit) + 1;
            // Ensure the new page is within bounds
            newPage = Math.max(1, Math.min(newPage, newTotalPages));
            setLimit(newLimit);
        }

        // Ensure the page is always valid
        const validPage = Math.max(1, Math.min(newPage, totalPages));
        setCurrentPage(validPage);
    };

    const defaultColumns: TCustomColumnDef<Assignment>[] = [
        {
            accessorKey: 'serial',
            header: '#ID',
            cell: ({ row }) => <span>{row.index + 1}</span>,
            footer: (data) => data.column.id,
            id: 'serial',
            visible: !isMobile,
            canHide: true,
        },
        {
            accessorKey: 'question',
            header: 'Title',
            cell: ({ row }) => (
                <span className='line-clamp-2'>{row.original.question}</span>
            ),
            footer: (data) => data.column.id,
            id: 'question',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status='not_answered' />,
            footer: (data) => data.column.id,
            id: 'status',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'mark',
            header: 'Marks',
            cell: ({ row }) => <span>{row.original.mark}</span>,
            footer: (data) => data.column.id,
            id: 'mark',
            visible: !isMobile,
            canHide: true,
        },
        {
            accessorKey: 'dueDate',
            header: 'Deadline',
            cell: ({ row }) => <TdDate date={row.original.dueDate || ''} />,
            footer: (data) => data.column.id,
            id: 'dueDate',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'workshop',
            header: 'Workshop',
            cell: ({ row }) => <TdDate date={row.original.workshop} />,
            footer: (data) => data.column.id,
            id: 'workshop',
            visible: !isMobile,
            canHide: true,
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div
                    className={`flex items-center ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}
                >
                    <Button
                        size='sm'
                        variant='default'
                        disabled={false}
                        onClick={() => handleTestNowClick(row.original)}
                        className='hover:bg-primary-light rounded-md px-3.5 py-2.5 h-auto w-full'
                    >
                        {isMobile ? 'Test' : 'Test Now'}{' '}
                        <span className='ml-1'>→</span>
                    </Button>
                    <Button
                        size='sm'
                        disabled={false}
                        onClick={() => handleSeeResultClick(row.original)}
                        variant='ghost'
                        className='rounded-md px-3.5 py-2 h-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray w-full'
                    >
                        <Eye className='h-5 w-5' />
                        {!isMobile && 'See Result'}
                    </Button>
                </div>
            ),
            footer: (data) => data.column.id,
            id: 'actions',
            visible: true,
            canHide: false,
        },
    ];

    return (
        <div className='min-h-[calc(100vh-120px)] flex flex-col justify-between'>
            <div className='flex-1'>
                <GlobalHeader
                    title='Technical Test'
                    subTitle='Assess Technical Skills with Accuracy and Speed'
                    buttons={
                        <div className='flex items-center gap-2'>
                            <Button
                                variant={!isGridView ? 'outline' : 'default'}
                                onClick={() => setIsGridView(true)}
                                className={isMobile ? 'px-2' : ''}
                            >
                                <LayoutGrid size={16} />
                            </Button>
                            <Button
                                variant={isGridView ? 'outline' : 'default'}
                                onClick={() => setIsGridView(false)}
                                className={isMobile ? 'px-2' : ''}
                            >
                                <List size={16} />
                            </Button>
                            <FilterModal
                                value={[]}
                                columns={[]}
                                onChange={() => null}
                            />
                        </div>
                    }
                />
                <TechnicalMetrics />
                <Tabs defaultValue='tasks' className='w-full'>
                    <TabsList
                        className={`p-0 bg-transparent ${isMobile ? 'flex flex-wrap overflow-x-auto' : ''}`}
                    >
                        <TabsTrigger
                            value='tasks'
                            className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent shadow-none'
                        >
                            <FileText className='h-5 w-5' />
                            <span className={isMobile ? 'text-xs' : ''}>
                                Technical Task ({assignments.length})
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value='assignments'
                            className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent shadow-none'
                        >
                            <ClipboardList className='h-5 w-5' />
                            <span className={isMobile ? 'text-xs' : ''}>
                                Assignments ({assignments.length})
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value='questions'
                            className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent shadow-none'
                        >
                            <MessageCircleQuestion className='h-5 w-5' />
                            <span className={isMobile ? 'text-xs' : ''}>
                                Technical Question (0)
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value='tasks' className='mt-2.5'>
                        {isGridView ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
                                {assignments.map((assignment, index) => (
                                    <TaskCard
                                        key={index}
                                        task={{
                                            id: assignment.id.toString(),
                                            title: assignment.question,
                                            marks: assignment.mark,
                                            deadline: assignment.dueDate || '',
                                            workshop: assignment.workshop,
                                            status: 'not_answered',
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className='overflow-x-auto'>
                                <GlobalTable
                                    isLoading={isLoading}
                                    limit={limit}
                                    data={assignments}
                                    defaultColumns={defaultColumns}
                                    tableName='technical-tasks-table'
                                />
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value='assignments' className='mt-2.5'>
                        {isGridView ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
                                {assignments.map((assignment, index) => (
                                    <TaskCard
                                        key={index}
                                        task={{
                                            id: assignment.id.toString(),
                                            title: assignment.question,
                                            marks: assignment.mark,
                                            deadline: assignment.dueDate || '',
                                            workshop: assignment.workshop,
                                            status: 'not_answered',
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className='overflow-x-auto'>
                                <GlobalTable
                                    isLoading={isLoading}
                                    limit={limit}
                                    data={assignments}
                                    defaultColumns={defaultColumns}
                                    tableName='technical-assignments-table'
                                />
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value='questions' className='mt-6'>
                        <div className='text-center py-10 text-muted-foreground'>
                            No questions to display.
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <div className='mt-4'>
                <GlobalPagination
                    totalItems={totalItems}
                    currentPage={currentPage}
                    itemsPerPage={limit}
                    onPageChange={handlePageChange}
                />
            </div>

            {selectedTask && (
                <TaskModal
                    isOpen={modalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedTask(null);
                    }}
                    mode={modalMode}
                    taskData={{
                        id: selectedTask.id.toString(),
                        title: selectedTask.question,
                        marks: selectedTask.mark,
                        deadline: selectedTask.dueDate || '',
                        workshop: selectedTask.workshop,
                    }}
                />
            )}
        </div>
    );
};

export default TechnicalTest;
