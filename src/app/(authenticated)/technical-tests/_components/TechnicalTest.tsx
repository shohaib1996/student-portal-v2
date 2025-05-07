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
    type TCustomColumnDef,
} from '@/components/global/GlobalTable/GlobalTable';
import TdDate from '@/components/global/TdDate';
import { StatusBadge, type StatusType } from './status-badge';
import TaskModal from './TaskModal';
import { useRouter, useSearchParams } from 'next/navigation';
import type { TConditions } from '@/components/global/FilterModal/QueryBuilder';
import SortMenu from '@/components/global/SortMenu';

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
    submission?: {
        status?: string;
        mark?: number;
        answer?: string;
        discussions?: any[];
    };
}

type TabType = 'tasks' | 'assignments' | 'questions';
type ViewType = 'grid' | 'list';

const TechnicalTest = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get tab and view from URL query parameters
    const tabParam = searchParams.get('tab') as TabType | null;
    const viewParam = searchParams.get('view') as ViewType | null;

    const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'tasks');
    const [filterData, setFilterData] = useState<TConditions[]>([]);
    const [sortData, setSortData] = useState<Record<string, number>>({});
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [workshopDate, setWorkshopDate] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [type, setType] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [limit, setLimit] = useState(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isGridView, setIsGridView] = useState<boolean>(viewParam !== 'list');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'test' | 'result'>('test');
    const [selectedItem, setSelectedItem] = useState<Assignment | null>(null);
    const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
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

    // Update URL when tab or view changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', activeTab);
        params.set('view', isGridView ? 'grid' : 'list');
        router.push(`?${params.toString()}`, { scroll: false });
    }, [activeTab, isGridView, router, searchParams]);

    // Reset pagination when changing tabs
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    // Map tab to category for API request
    const getCategoryForTab = (tab: TabType): string => {
        switch (tab) {
            case 'tasks':
                return 'task';
            case 'assignments':
                return 'assignment';
            case 'questions':
                return 'question';
            default:
                return '';
        }
    };

    const { data, isLoading } = useGetTechnicalTestsQuery({
        page: currentPage,
        limit: limit,
        category: getCategoryForTab(activeTab),
        query: searchQuery,
        type: type,
        status: status,
    });

    const assignments: Assignment[] = data?.assignments || [];
    const stats = data?.stats;
    const totalItems = data?.count || 0;

    const handleTestNowClick = (item: Assignment, index: number) => {
        setModalMode('test');
        setSelectedItem(item);
        setCurrentItemIndex(index);
        setModalOpen(true);
    };

    const handleSeeResultClick = (item: Assignment, index: number) => {
        setModalMode('result');
        setSelectedItem(item);
        setCurrentItemIndex(index);
        setModalOpen(true);
    };

    const handlePageChange = (page: number, newLimit?: number) => {
        setCurrentPage(page);
        if (newLimit) {
            setLimit(newLimit);
        }
    };

    // Toggle view mode
    const toggleViewMode = (isGrid: boolean) => {
        setIsGridView(isGrid);
    };

    // Handle next and previous navigation in the modal
    const handleNext = (current: number) => {
        if (current < assignments.length - 1) {
            setCurrentItemIndex(current + 1);
            setSelectedItem(assignments[current + 1]);
        }
    };

    const handlePrevious = (current: number) => {
        if (current > 0) {
            setCurrentItemIndex(current - 1);
            setSelectedItem(assignments[current - 1]);
        }
    };

    // Handle updating answer
    const handleUpdateAnswer = (answer: any, id: string) => {
        const updatedAssignments = assignments.map((assignment) => {
            if (assignment._id === id) {
                return {
                    ...assignment,
                    submission: {
                        ...assignment.submission,
                        ...answer,
                    },
                };
            }
            return assignment;
        });

        // Update the selected item if it's the one that was updated
        if (selectedItem && selectedItem._id === id) {
            setSelectedItem({
                ...selectedItem,
                submission: {
                    ...selectedItem.submission,
                    ...answer,
                },
            });
        }
    };

    // Handle updating discussions
    const handleUpdateDiscussions = (discussions: any[], id: string) => {
        const updatedAssignments = assignments.map((assignment) => {
            if (assignment._id === id) {
                return {
                    ...assignment,
                    submission: {
                        ...assignment.submission,
                        discussions,
                    },
                };
            }
            return assignment;
        });

        // Update the selected item if it's the one that was updated
        if (selectedItem && selectedItem._id === id) {
            setSelectedItem({
                ...selectedItem,
                submission: {
                    ...selectedItem.submission,
                    discussions,
                },
            });
        }
    };

    const handleFilter = (
        conditions: TConditions[],
        queryObj: Record<string, string>,
    ) => {
        setFilterData(conditions);
        setSearchQuery(queryObj['query'] || '');
        setStatus(queryObj['status'] === 'all' ? '' : queryObj['status']);
        setType(queryObj['type'] === 'all' ? '' : queryObj['type']);

        // Convert the workshop date to a Date object if it exists
        if (queryObj['workshop']) {
            setSelectedDate(new Date(queryObj['workshop']));
        } else {
            setSelectedDate(undefined);
        }

        setCurrentPage(1);
    };

    // Custom columns for each tab type
    const getColumnsForTab = (
        tabType: TabType,
    ): TCustomColumnDef<Assignment>[] => {
        const baseColumns: TCustomColumnDef<Assignment>[] = [
            {
                accessorKey: 'serial',
                header: '#ID',
                cell: ({ row }) => (
                    <span>{row.original.id || row.index + 1}</span>
                ),
                footer: (data) => data.column.id,
                id: 'serial',
                visible: !isMobile,
                canHide: true,
            },
            {
                accessorKey: 'question',
                header: 'Title',
                cell: ({ row }) => (
                    <span className='line-clamp-2'>
                        {row.original.question}
                    </span>
                ),
                footer: (data) => data.column.id,
                id: 'question',
                visible: true,
                canHide: false,
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                    <StatusBadge
                        status={
                            (row.original.submission?.status as StatusType) ||
                            'not_answered'
                        }
                    />
                ),
                footer: (data) => data.column.id,
                id: 'status',
                visible: true,
                canHide: true,
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
        ];

        // Add tab-specific columns
        if (tabType === 'tasks') {
            return [
                ...baseColumns,
                {
                    accessorKey: 'category',
                    header: 'Category',
                    cell: ({ row }) => (
                        <span className='capitalize'>
                            {row.original.category}
                        </span>
                    ),
                    footer: (data) => data.column.id,
                    id: 'category',
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
                                disabled={
                                    row.original.submission?.status ===
                                        'completed' ||
                                    row.original.submission?.status ===
                                        'pending' ||
                                    row.original.submission?.status ===
                                        'rejected' ||
                                    row.original.submission?.status ===
                                        'accepted'
                                }
                                onClick={() =>
                                    handleTestNowClick(row.original, row.index)
                                }
                                className='hover:bg-primary-light rounded-md px-3.5 py-2.5 h-auto w-fit'
                            >
                                {isMobile ? 'Test' : 'Test Now'}{' '}
                                <span className='ml-1'>→</span>
                            </Button>
                            <Button
                                size='sm'
                                disabled={
                                    !row.original.submission?.status ||
                                    row.original.submission?.status ===
                                        'not_answered'
                                }
                                onClick={() =>
                                    handleSeeResultClick(
                                        row.original,
                                        row.index,
                                    )
                                }
                                variant='primary_light'
                                className='rounded-md px-3.5 py-2 h-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray w-fit'
                            >
                                <Eye className='h-5 w-5' />
                                {!isMobile && 'See Result'}
                            </Button>
                        </div>
                    ),
                    footer: (data) => data.column.id,
                    id: 'action',
                    visible: true,
                    canHide: false,
                },
            ];
        } else if (tabType === 'assignments') {
            return [
                ...baseColumns,
                {
                    accessorKey: 'attachments',
                    header: 'Attachments',
                    cell: ({ row }) => (
                        <span>{row.original.attachments?.length || 0}</span>
                    ),
                    footer: (data) => data.column.id,
                    id: 'attachments',
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
                                disabled={
                                    row.original.submission?.status ===
                                        'completed' ||
                                    row.original.submission?.status ===
                                        'pending' ||
                                    row.original.submission?.status ===
                                        'rejected' ||
                                    row.original.submission?.status ===
                                        'accepted'
                                }
                                onClick={() =>
                                    handleTestNowClick(row.original, row.index)
                                }
                                className='hover:bg-primary-light rounded-md px-3.5 py-2.5 h-auto w-fit'
                            >
                                {isMobile ? 'Test' : 'Test Now'}{' '}
                                <span className='ml-1'>→</span>
                            </Button>
                            <Button
                                size='sm'
                                disabled={
                                    !row.original.submission?.status ||
                                    row.original.submission?.status ===
                                        'not_answered'
                                }
                                onClick={() =>
                                    handleSeeResultClick(
                                        row.original,
                                        row.index,
                                    )
                                }
                                variant='primary_light'
                                className='rounded-md px-3.5 py-2 h-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray w-fit'
                            >
                                <Eye className='h-5 w-5' />
                                {!isMobile && 'See Result'}
                            </Button>
                        </div>
                    ),
                    footer: (data) => data.column.id,
                    id: 'action',
                    visible: true,
                    canHide: false,
                },
            ];
        } else if (tabType === 'questions') {
            return [
                ...baseColumns,
                {
                    accessorKey: 'obtainedMark',
                    header: 'Obtained Mark',
                    cell: ({ row }) => (
                        <span>{row.original.submission?.mark || 'N/A'}</span>
                    ),
                    footer: (data) => data.column.id,
                    id: 'obtainedMark',
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
                                disabled={
                                    row.original.submission?.status ===
                                        'completed' ||
                                    row.original.submission?.status ===
                                        'pending' ||
                                    row.original.submission?.status ===
                                        'rejected' ||
                                    row.original.submission?.status ===
                                        'accepted'
                                }
                                onClick={() =>
                                    handleTestNowClick(row.original, row.index)
                                }
                                className='hover:bg-primary-light rounded-md px-3.5 py-2.5 h-auto w-fit'
                            >
                                {isMobile ? 'Test' : 'Test Now'}{' '}
                                <span className='ml-1'>→</span>
                            </Button>
                            <Button
                                size='sm'
                                disabled={
                                    !row.original.submission?.status ||
                                    row.original.submission?.status ===
                                        'not_answered'
                                }
                                onClick={() =>
                                    handleSeeResultClick(
                                        row.original,
                                        row.index,
                                    )
                                }
                                variant='primary_light'
                                className='rounded-md px-3.5 py-2 h-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray w-fit'
                            >
                                <Eye className='h-5 w-5' />
                                {!isMobile && 'See Result'}
                            </Button>
                        </div>
                    ),
                    footer: (data) => data.column.id,
                    id: 'action',
                    visible: true,
                    canHide: false,
                },
            ];
        }

        return [
            ...baseColumns,
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
                            disabled={
                                row.original.submission?.status ===
                                    'completed' ||
                                row.original.submission?.status === 'pending' ||
                                row.original.submission?.status ===
                                    'rejected' ||
                                row.original.submission?.status === 'accepted'
                            }
                            onClick={() =>
                                handleTestNowClick(row.original, row.index)
                            }
                            className='hover:bg-primary-light rounded-md px-3.5 py-2.5 h-auto w-fit'
                        >
                            {isMobile ? 'Test' : 'Test Now'}{' '}
                            <span className='ml-1'>→</span>
                        </Button>
                        <Button
                            size='sm'
                            disabled={
                                !row.original.submission?.status ||
                                row.original.submission?.status ===
                                    'not_answered'
                            }
                            onClick={() =>
                                handleSeeResultClick(row.original, row.index)
                            }
                            variant='primary_light'
                            className='rounded-md px-3.5 py-2 h-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray w-fit'
                        >
                            <Eye className='h-5 w-5' />
                            {!isMobile && 'See Result'}
                        </Button>
                    </div>
                ),
                footer: (data) => data.column.id,
                id: 'action',
                visible: true,
                canHide: false,
            },
        ];
    };

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
                                onClick={() => toggleViewMode(true)}
                                className={isMobile ? 'px-2' : ''}
                                tooltip='Grid View'
                            >
                                <LayoutGrid size={16} />
                            </Button>
                            <Button
                                variant={isGridView ? 'outline' : 'default'}
                                onClick={() => toggleViewMode(false)}
                                className={isMobile ? 'px-2' : ''}
                                tooltip='List View'
                            >
                                <List size={16} />
                            </Button>
                            <FilterModal
                                value={filterData}
                                onChange={handleFilter}
                                columns={[
                                    {
                                        label: 'Search by name or description',
                                        value: 'query',
                                    },
                                    {
                                        label: 'Status',
                                        value: 'status',
                                        type: 'select',
                                        options: [
                                            {
                                                value: 'pending',
                                                label: 'Pending',
                                            },
                                            {
                                                value: 'accepted',
                                                label: 'Accepted',
                                            },
                                            {
                                                value: 'rejected',
                                                label: 'Rejected',
                                            },
                                        ],
                                    },
                                    {
                                        label: 'Type',
                                        value: 'type',
                                        type: 'select',
                                        options: [
                                            { value: 'all', label: 'All Type' },
                                            {
                                                value: 'answered',
                                                label: 'Answered',
                                            },
                                            {
                                                value: 'notanswered',
                                                label: 'Not Answered',
                                            },
                                        ],
                                    },
                                ]}
                            />
                        </div>
                    }
                />
                <Tabs
                    value={activeTab}
                    defaultValue='tasks'
                    className='w-full'
                    onValueChange={(value) => setActiveTab(value as TabType)}
                >
                    <TabsList
                        className={`p-0 bg-transparent ${isMobile ? 'flex flex-wrap overflow-x-auto' : ''}`}
                    >
                        <TabsTrigger
                            value='tasks'
                            className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent !shadow-none'
                        >
                            <FileText className='h-5 w-5' />
                            <span className={isMobile ? 'text-xs' : ''}>
                                Technical Task ({stats?.totalTechnicalTasks})
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value='assignments'
                            className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent !shadow-none'
                        >
                            <ClipboardList className='h-5 w-5' />
                            <span className={isMobile ? 'text-xs' : ''}>
                                Assignments ({stats?.totalTechnicalAssignments})
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value='questions'
                            className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent !shadow-none'
                        >
                            <MessageCircleQuestion className='h-5 w-5' />
                            <span className={isMobile ? 'text-xs' : ''}>
                                Technical Question (
                                {stats?.totalTechnicalQuestions})
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    <TechnicalMetrics
                        stats={stats}
                        assignments={data?.assignments || []}
                    />

                    <TabsContent value='tasks' className='mt-2.5'>
                        {isLoading ? (
                            <div className='text-center py-10'>Loading...</div>
                        ) : assignments.length === 0 ? (
                            <div className='text-center py-10 text-muted-foreground'>
                                No technical tasks to display.
                            </div>
                        ) : isGridView ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
                                {assignments.map((task, index) => (
                                    <TaskCard
                                        activeTab={activeTab}
                                        key={task._id}
                                        task={{
                                            id: task.id?.toString(),
                                            title: task.question,
                                            marks: task.mark,
                                            deadline: task.dueDate || '',
                                            workshop: task.workshop,
                                            status:
                                                (task.submission
                                                    ?.status as StatusType) ||
                                                'not_answered',
                                            category: task.category,
                                            attachments:
                                                task.attachments?.length || 0,
                                            obtainedMark: task.submission?.mark,
                                        }}
                                        onTestNow={() =>
                                            handleTestNowClick(task, index)
                                        }
                                        onSeeResult={() =>
                                            handleSeeResultClick(task, index)
                                        }
                                    />
                                ))}
                            </div>
                        ) : (
                            <GlobalTable
                                actionsMinSize={300}
                                isLoading={isLoading}
                                limit={limit}
                                data={assignments}
                                defaultColumns={getColumnsForTab('tasks')}
                                tableName='technical-tasks-table'
                            />
                        )}
                    </TabsContent>

                    <TabsContent value='assignments' className='mt-2.5'>
                        {isLoading ? (
                            <div className='text-center py-10'>Loading...</div>
                        ) : assignments.length === 0 ? (
                            <div className='text-center py-10 text-muted-foreground'>
                                No assignments to display.
                            </div>
                        ) : isGridView ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
                                {assignments.map((assignment, index) => (
                                    <TaskCard
                                        activeTab={activeTab}
                                        key={assignment._id}
                                        task={{
                                            id: assignment.id?.toString(),
                                            title: assignment.question,
                                            marks: assignment.mark,
                                            deadline: assignment.dueDate || '',
                                            workshop: assignment.workshop,
                                            status:
                                                (assignment.submission
                                                    ?.status as StatusType) ||
                                                'not_answered',
                                            category: assignment.category,
                                            attachments:
                                                assignment.attachments
                                                    ?.length || 0,
                                            obtainedMark:
                                                assignment.submission?.mark,
                                        }}
                                        onTestNow={() =>
                                            handleTestNowClick(
                                                assignment,
                                                index,
                                            )
                                        }
                                        onSeeResult={() =>
                                            handleSeeResultClick(
                                                assignment,
                                                index,
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        ) : (
                            <GlobalTable
                                actionsMinSize={300}
                                isLoading={isLoading}
                                limit={limit}
                                data={assignments}
                                defaultColumns={getColumnsForTab('assignments')}
                                tableName='technical-assignments-table'
                            />
                        )}
                    </TabsContent>

                    <TabsContent value='questions' className='mt-2.5'>
                        {isLoading ? (
                            <div className='text-center py-10'>Loading...</div>
                        ) : assignments.length === 0 ? (
                            <div className='text-center py-10 text-muted-foreground'>
                                No technical questions to display.
                            </div>
                        ) : isGridView ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
                                {assignments.map((question, index) => (
                                    <TaskCard
                                        activeTab={activeTab}
                                        key={question._id}
                                        task={{
                                            id: question.id?.toString(),
                                            title: question.question,
                                            marks: question.mark,
                                            deadline: question.dueDate || '',
                                            workshop: question.workshop,
                                            status:
                                                (question.submission
                                                    ?.status as StatusType) ||
                                                'not_answered',
                                            category: question.category,
                                            attachments:
                                                question.attachments?.length ||
                                                0,
                                            obtainedMark:
                                                question.submission?.mark,
                                        }}
                                        onTestNow={() =>
                                            handleTestNowClick(question, index)
                                        }
                                        onSeeResult={() =>
                                            handleSeeResultClick(
                                                question,
                                                index,
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        ) : (
                            <GlobalTable
                                actionsMinSize={300}
                                isLoading={isLoading}
                                limit={limit}
                                data={assignments}
                                defaultColumns={getColumnsForTab('questions')}
                                tableName='technical-questions-table'
                            />
                        )}
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

            {selectedItem && (
                <TaskModal
                    isOpen={modalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedItem(null);
                    }}
                    activeTab={activeTab}
                    mode={modalMode}
                    taskData={{
                        id: selectedItem?.id?.toString(),
                        title: selectedItem?.question,
                        marks: selectedItem?.mark,
                        deadline: selectedItem?.dueDate || '',
                        workshop: selectedItem?.workshop,
                        status: selectedItem?.submission?.status as StatusType,
                        obtainedMark: selectedItem?.submission?.mark,
                        category: selectedItem.category,
                        attachments: selectedItem.attachments,
                    }}
                    handleNext={handleNext}
                    handleprevious={handlePrevious}
                    current={currentItemIndex}
                    assignments={assignments}
                    update={handleUpdateAnswer}
                    handleUpdateDiscussions={handleUpdateDiscussions}
                />
            )}
        </div>
    );
};

export default TechnicalTest;
