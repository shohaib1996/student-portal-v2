'use client';
import {
    FileText,
    ClipboardList,
    MessageCircleQuestion,
    BookOpenText,
    Eye,
    LayoutGrid,
    List,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskCard, { Task } from './TaskCard';
import GlobalHeader from '@/components/global/GlobalHeader';
import { Button } from '@/components/ui/button';
import { useGetTechnicalTestsQuery } from '@/redux/api/technicalTest/technicalTest';
import { useState } from 'react';
import GlobalPagination from '@/components/global/GlobalPagination';
import { cn } from '@/lib/utils';

const tasks: Task[] = [
    {
        id: '543767',
        title: 'How does using object-fit improve responsive design?',
        marks: 10,
        deadline: 'Mar 10, 2025',
        workshop: 'Mar 10, 2025',
        status: 'not_answered',
    },
    {
        id: '543767',
        title: 'How does using object-fit...',
        marks: 10,
        deadline: 'Mar 10, 2025',
        workshop: 'Mar 10, 2025',
        status: 'completed',
    },
    {
        id: '543767',
        title: 'How does using object-fit...',
        marks: 10,
        deadline: 'Mar 10, 2025',
        workshop: 'Mar 10, 2025',
        status: 'rejected',
    },
    {
        id: '543767',
        title: 'How does using object-fit...',
        marks: 10,
        deadline: 'Mar 10, 2025',
        workshop: 'Mar 10, 2025',
        status: 'pending',
    },
    {
        id: '543767',
        title: 'How does using object-fit...',
        marks: 10,
        deadline: 'Mar 10, 2025',
        workshop: 'Mar 10, 2025',
        status: 'not_answered',
    },
    {
        id: '543767',
        title: 'How does using object-fit...',
        marks: 10,
        deadline: 'Mar 10, 2025',
        workshop: 'Mar 10, 2025',
        status: 'pending',
    },
    {
        id: '543767',
        title: 'How does using object-fit...',
        marks: 10,
        deadline: 'Mar 10, 2025',
        workshop: 'Mar 10, 2025',
        status: 'completed',
    },
    {
        id: '543767',
        title: 'How does using object-fit...',
        marks: 10,
        deadline: 'Mar 10, 2025',
        workshop: 'Mar 10, 2025',
        status: 'pending',
    },
    {
        id: '543767',
        title: 'How does using object-fit...',
        marks: 10,
        deadline: 'Mar 10, 2025',
        workshop: 'Mar 10, 2025',
        status: 'not_answered',
    },
    {
        id: '543767',
        title: 'How does using object-fit...',
        marks: 10,
        deadline: 'Mar 10, 2025',
        workshop: 'Mar 10, 2025',
        status: 'pending',
    },
    {
        id: '543767',
        title: 'How does using object-fit...',
        marks: 10,
        deadline: 'Mar 10, 2025',
        workshop: 'Mar 10, 2025',
        status: 'not_answered',
    },
    {
        id: '543767',
        title: 'How does using object-fit...',
        marks: 10,
        deadline: 'Mar 10, 2025',
        workshop: 'Mar 10, 2025',
        status: 'pending',
    },
    {
        id: '543767',
        title: 'How does using object-fit...',
        marks: 10,
        deadline: 'Mar 10, 2025',
        workshop: 'Mar 10, 2025',
        status: 'not_answered',
    },
    {
        id: '543767',
        title: 'How does using object-fit...',
        marks: 10,
        deadline: 'Mar 10, 2025',
        workshop: 'Mar 10, 2025',
        status: 'completed',
    },
    {
        id: '543767',
        title: 'How does using object-fit...',
        marks: 10,
        deadline: 'Mar 10, 2025',
        workshop: 'Mar 10, 2025',
        status: 'not_answered',
    },
];

const TechnicalTest = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [type, setType] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [limit, setLimit] = useState(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isGridView, setIsGridView] = useState<boolean>(true);

    const { data, isLoading } = useGetTechnicalTestsQuery({
        page: currentPage,
        limit: limit,
        workshop: selectedDate || null,
        category: category,
        query: searchQuery,
        type: type,
        status: '',
    });

    return (
        <>
            <GlobalHeader
                title='Technical Test'
                subTitle='Assess Technical Skills with Accuracy and Speed'
                buttons={
                    <div className='flex items-center gap-2'>
                        <Button
                            variant={!isGridView ? 'outline' : 'default'}
                            onClick={() => setIsGridView(true)}
                        >
                            <LayoutGrid />
                        </Button>
                        <Button
                            variant={isGridView ? 'outline' : 'default'}
                            onClick={() => setIsGridView(false)}
                        >
                            <List />
                        </Button>
                    </div>
                }
            />
            <Tabs defaultValue='tasks' className='w-full'>
                <TabsList className='p-0 bg-transparent'>
                    <TabsTrigger
                        value='tasks'
                        className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent shadow-none'
                    >
                        <FileText className='h-5 w-5' />
                        <span>Technical Task (15)</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value='assignments'
                        className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent shadow-none'
                    >
                        <ClipboardList className='h-5 w-5' />
                        <span>Assignments (5)</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value='questions'
                        className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent shadow-none'
                    >
                        <MessageCircleQuestion className='h-5 w-5' />
                        <span>Technical Question (6)</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='tasks' className='mt-2.5'>
                    {isGridView ? (
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-3'>
                            {tasks.map((task, index) => (
                                <TaskCard key={index} task={task} />
                            ))}
                        </div>
                    ) : (
                        'list view is under the development'
                    )}
                </TabsContent>

                <TabsContent value='assignments' className='mt-6'>
                    <div className='text-center py-10 text-muted-foreground'>
                        No assignments to display.
                    </div>
                </TabsContent>

                <TabsContent value='questions' className='mt-6'>
                    <div className='text-center py-10 text-muted-foreground'>
                        No questions to display.
                    </div>
                </TabsContent>
            </Tabs>
            <GlobalPagination
                totalItems={tasks.length || 0}
                currentPage={currentPage}
                itemsPerPage={limit}
                onPageChange={(page, newLimit) => {
                    setCurrentPage(page);
                    setLimit(newLimit);
                }}
            />
        </>
    );
};

export default TechnicalTest;
