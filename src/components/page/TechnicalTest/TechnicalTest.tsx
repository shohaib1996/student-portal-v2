'use client';
import { FileText, ClipboardList, MessageCircleQuestion } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskCard, { Task } from './TaskCard';

const tasks: Task[] = [
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
    return (
        <div className='container my-10 mx-auto'>
            <Tabs defaultValue='tasks' className='w-full'>
                <TabsList className='h-auto p-0'>
                    <TabsTrigger
                        value='tasks'
                        className='flex items-center gap-2 px-4 py-3 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent text-gray-600 h-auto'
                    >
                        <FileText className='h-5 w-5' />
                        <span>Technical Task (15)</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value='assignments'
                        className='flex items-center gap-2 px-4 py-3 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent text-gray-600 h-auto'
                    >
                        <ClipboardList className='h-5 w-5' />
                        <span>Assignments (5)</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value='questions'
                        className='flex items-center gap-2 px-4 py-3 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent text-gray-600 h-auto'
                    >
                        <MessageCircleQuestion className='h-5 w-5' />
                        <span>Technical Question (6)</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='tasks' className='mt-2.5'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-3'>
                        {tasks.map((task, index) => (
                            <TaskCard key={index} task={task} />
                        ))}
                    </div>
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
        </div>
    );
};

export default TechnicalTest;
