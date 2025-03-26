// 'use client';
// import {
//     FileText,
//     ClipboardList,
//     MessageCircleQuestion,
//     BookOpenText,
//     Eye,
//     LayoutGrid,
//     List,
// } from 'lucide-react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import TaskCard, { Task } from './TaskCard';
// import GlobalHeader from '@/components/global/GlobalHeader';
// import { Button } from '@/components/ui/button';
// import { useGetTechnicalTestsQuery } from '@/redux/api/technicalTest/technicalTest';
// import { useState } from 'react';
// import GlobalPagination from '@/components/global/GlobalPagination';
// import { cn } from '@/lib/utils';
// import TechnicalMetrics from './TechnicalMetrics';
// import FilterModal from '@/components/global/FilterModal/FilterModal';
// import GlobalTable, {
//     TCustomColumnDef,
// } from '@/components/global/GlobalTable/GlobalTable';
// import TdDate from '@/components/global/TdDate';
// import { StatusBadge } from './status-badge';
// import TaskModal from './TaskModal';

// const tasks: Task[] = [
//     {
//         id: '543767',
//         title: 'How does using object-fit improve responsive design?',
//         marks: 10,
//         deadline: 'Mar 10, 2025',
//         workshop: 'Mar 10, 2025',
//         status: 'not_answered',
//     },
//     {
//         id: '543767',
//         title: 'How does using object-fit...',
//         marks: 10,
//         deadline: 'Mar 10, 2025',
//         workshop: 'Mar 10, 2025',
//         status: 'completed',
//     },
//     {
//         id: '543767',
//         title: 'How does using object-fit...',
//         marks: 10,
//         deadline: 'Mar 10, 2025',
//         workshop: 'Mar 10, 2025',
//         status: 'rejected',
//     },
//     {
//         id: '543767',
//         title: 'How does using object-fit...',
//         marks: 10,
//         deadline: 'Mar 10, 2025',
//         workshop: 'Mar 10, 2025',
//         status: 'pending',
//     },
//     {
//         id: '543767',
//         title: 'How does using object-fit...',
//         marks: 10,
//         deadline: 'Mar 10, 2025',
//         workshop: 'Mar 10, 2025',
//         status: 'not_answered',
//     },
//     {
//         id: '543767',
//         title: 'How does using object-fit...',
//         marks: 10,
//         deadline: 'Mar 10, 2025',
//         workshop: 'Mar 10, 2025',
//         status: 'pending',
//     },
//     {
//         id: '543767',
//         title: 'How does using object-fit...',
//         marks: 10,
//         deadline: 'Mar 10, 2025',
//         workshop: 'Mar 10, 2025',
//         status: 'completed',
//     },
//     {
//         id: '543767',
//         title: 'How does using object-fit...',
//         marks: 10,
//         deadline: 'Mar 10, 2025',
//         workshop: 'Mar 10, 2025',
//         status: 'pending',
//     },
//     {
//         id: '543767',
//         title: 'How does using object-fit...',
//         marks: 10,
//         deadline: 'Mar 10, 2025',
//         workshop: 'Mar 10, 2025',
//         status: 'not_answered',
//     },
//     {
//         id: '543767',
//         title: 'How does using object-fit...',
//         marks: 10,
//         deadline: 'Mar 10, 2025',
//         workshop: 'Mar 10, 2025',
//         status: 'pending',
//     },
//     {
//         id: '543767',
//         title: 'How does using object-fit...',
//         marks: 10,
//         deadline: 'Mar 10, 2025',
//         workshop: 'Mar 10, 2025',
//         status: 'not_answered',
//     },
//     {
//         id: '543767',
//         title: 'How does using object-fit...',
//         marks: 10,
//         deadline: 'Mar 10, 2025',
//         workshop: 'Mar 10, 2025',
//         status: 'pending',
//     },
//     {
//         id: '543767',
//         title: 'How does using object-fit...',
//         marks: 10,
//         deadline: 'Mar 10, 2025',
//         workshop: 'Mar 10, 2025',
//         status: 'not_answered',
//     },
//     {
//         id: '543767',
//         title: 'How does using object-fit...',
//         marks: 10,
//         deadline: 'Mar 10, 2025',
//         workshop: 'Mar 10, 2025',
//         status: 'completed',
//     },
//     {
//         id: '543767',
//         title: 'How does using object-fit...',
//         marks: 10,
//         deadline: 'Mar 10, 2025',
//         workshop: 'Mar 10, 2025',
//         status: 'not_answered',
//     },
// ];

// const TechnicalTest = () => {
//     const [searchQuery, setSearchQuery] = useState<string>('');
//     const [category, setCategory] = useState<string>('');
//     const [type, setType] = useState<string>('');
//     const [selectedDate, setSelectedDate] = useState<Date | undefined>();
//     const [limit, setLimit] = useState(10);
//     const [currentPage, setCurrentPage] = useState<number>(1);
//     const [isGridView, setIsGridView] = useState<boolean>(true);

//     const [modalOpen, setModalOpen] = useState(false);
//     const [modalMode, setModalMode] = useState<'test' | 'result'>('test');

//     const { data, isLoading } = useGetTechnicalTestsQuery({
//         page: currentPage,
//         limit: limit,
//         workshop: selectedDate || null,
//         category: category,
//         query: searchQuery,
//         type: type,
//         status: '',
//     });

//     console.log({ data });

//     const handleTestNowClick = () => {
//         setModalMode('test');
//         setModalOpen(true);
//     };

//     const handleSeeResultClick = () => {
//         setModalMode('result');
//         setModalOpen(true);
//     };

//     const defaultColumns: TCustomColumnDef<Task>[] = [
//         {
//             accessorKey: 'serial',
//             header: 'ID',
//             cell: ({ row }) => <span>{row.index + 1}</span>,
//             footer: (data) => data.column.id,
//             id: 'serial',
//             visible: true,
//             canHide: true,
//         },
//         {
//             accessorKey: 'title',
//             header: 'Task Title',
//             cell: ({ row }) => <span>{row.original.title}</span>,
//             footer: (data) => data.column.id,
//             id: 'title',
//             visible: true,
//             canHide: false,
//         },
//         {
//             accessorKey: 'status',
//             header: 'Status',
//             cell: ({ row }) => <StatusBadge status={row.original.status} />,
//             footer: (data) => data.column.id,
//             id: 'status',
//             visible: true,
//             canHide: false,
//         },
//         {
//             accessorKey: 'marks',
//             header: 'Marks',
//             cell: ({ row }) => <span>{row.original.marks}</span>,
//             footer: (data) => data.column.id,
//             id: 'marks',
//             visible: true,
//             canHide: true,
//         },
//         {
//             accessorKey: 'deadline',
//             header: 'Deadline',
//             cell: ({ row }) => <TdDate date={row.original.deadline} />,
//             footer: (data) => data.column.id,
//             id: 'deadline',
//             visible: true,
//             canHide: false,
//         },
//         {
//             accessorKey: 'workshop',
//             header: 'Workshop Date',
//             cell: ({ row }) => <TdDate date={row.original.workshop} />,
//             footer: (data) => data.column.id,
//             id: 'workshop',
//             visible: true,
//             canHide: true,
//         },

//         {
//             accessorKey: 'actions',
//             header: 'Actions',
//             cell: ({ row }) => (
//                 <>
//                     <div className='flex items-center gap-2'>
//                         <Button
//                             size='sm'
//                             variant={
//                                 row.original.status === 'completed' ||
//                                 row.original.status === 'pending' ||
//                                 row.original.status === 'rejected'
//                                     ? 'outline'
//                                     : 'default'
//                             }
//                             disabled={
//                                 row.original.status === 'completed' ||
//                                 row.original.status === 'pending' ||
//                                 row.original.status === 'rejected'
//                             }
//                             onClick={handleTestNowClick}
//                             className='hover:bg-primary-light rounded-md px-3.5 py-2.5 h-auto'
//                         >
//                             Test Now <span className='ml-1'>→</span>
//                         </Button>
//                         <Button
//                             size='sm'
//                             disabled={row.original.status === 'not_answered'}
//                             onClick={handleSeeResultClick}
//                             variant='ghost'
//                             className='rounded-md px-3.5 py-2 h-auto flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray '
//                         >
//                             <Eye className='h-5 w-5' />
//                             See Result
//                         </Button>
//                     </div>

//                     <TaskModal
//                         isOpen={modalOpen}
//                         onClose={() => setModalOpen(false)}
//                         mode={modalMode}
//                         taskData={{
//                             id: row.original.id,
//                             title: row.original.title,
//                             marks: row.original.marks,
//                             deadline: row.original.deadline,
//                             workshop: row.original.workshop,
//                         }}
//                     />
//                 </>
//             ),
//             footer: (data) => data.column.id,
//             id: 'actions',
//             visible: true,
//             canHide: false,
//         },
//     ];

//     return (
//         <>
//             <GlobalHeader
//                 title='Technical Test'
//                 subTitle='Assess Technical Skills with Accuracy and Speed'
//                 buttons={
//                     <div className='flex items-center gap-2'>
//                         <Button
//                             variant={!isGridView ? 'outline' : 'default'}
//                             onClick={() => setIsGridView(true)}
//                         >
//                             <LayoutGrid size={16} />
//                         </Button>
//                         <Button
//                             variant={isGridView ? 'outline' : 'default'}
//                             onClick={() => setIsGridView(false)}
//                         >
//                             <List size={16} />
//                         </Button>
//                         <FilterModal
//                             value={[]}
//                             columns={[]}
//                             onChange={() => null}
//                         />
//                     </div>
//                 }
//             />
//             <TechnicalMetrics />
//             <Tabs defaultValue='tasks' className='w-full'>
//                 <TabsList className='p-0 bg-transparent'>
//                     <TabsTrigger
//                         value='tasks'
//                         className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent shadow-none'
//                     >
//                         <FileText className='h-5 w-5' />
//                         <span>Technical Task (15)</span>
//                     </TabsTrigger>
//                     <TabsTrigger
//                         value='assignments'
//                         className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent shadow-none'
//                     >
//                         <ClipboardList className='h-5 w-5' />
//                         <span>Assignments (5)</span>
//                     </TabsTrigger>
//                     <TabsTrigger
//                         value='questions'
//                         className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent shadow-none'
//                     >
//                         <MessageCircleQuestion className='h-5 w-5' />
//                         <span>Technical Question (6)</span>
//                     </TabsTrigger>
//                 </TabsList>

//                 <TabsContent value='tasks' className='mt-2.5'>
//                     {isGridView ? (
//                         <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-3'>
//                             {tasks.map((task, index) => (
//                                 <TaskCard key={index} task={task} />
//                             ))}
//                         </div>
//                     ) : (
//                         <GlobalTable
//                             isLoading={false}
//                             limit={10}
//                             data={tasks}
//                             defaultColumns={defaultColumns}
//                             tableName='my-tasks-table'
//                         />
//                     )}
//                 </TabsContent>

//                 <TabsContent value='assignments' className='mt-6'>
//                     <div className='text-center py-10 text-muted-foreground'>
//                         No assignments to display.
//                     </div>
//                 </TabsContent>

//                 <TabsContent value='questions' className='mt-6'>
//                     <div className='text-center py-10 text-muted-foreground'>
//                         No questions to display.
//                     </div>
//                 </TabsContent>
//             </Tabs>
//             <GlobalPagination
//                 totalItems={tasks.length || 0}
//                 currentPage={currentPage}
//                 itemsPerPage={limit}
//                 onPageChange={(page, newLimit) => {
//                     setCurrentPage(page);
//                     setLimit(newLimit);
//                 }}
//             />
//         </>
//     );
// };

// export default TechnicalTest;
// 'use client';
// import {
//     FileText,
//     ClipboardList,
//     MessageCircleQuestion,
//     LayoutGrid,
//     List,
//     Eye,
// } from 'lucide-react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import TaskCard from './TaskCard';
// import GlobalHeader from '@/components/global/GlobalHeader';
// import { Button } from '@/components/ui/button';
// import { useGetTechnicalTestsQuery } from '@/redux/api/technicalTest/technicalTest';
// import { useState } from 'react';
// import GlobalPagination from '@/components/global/GlobalPagination';
// import { cn } from '@/lib/utils';
// import TechnicalMetrics from './TechnicalMetrics';
// import FilterModal from '@/components/global/FilterModal/FilterModal';
// import GlobalTable, {
//     TCustomColumnDef,
// } from '@/components/global/GlobalTable/GlobalTable';
// import TdDate from '@/components/global/TdDate';
// import { TdUser } from '@/components/global/TdUser';
// import TaskModal from './TaskModal';
// import { StatusBadge } from './status-badge';

// interface Assignment {
//     _id: string;
//     attachments: string[];
//     groups: {
//         activeStatus: { isActive: boolean; activeUntill: string } | null;
//         _id: string;
//         title: string;
//     }[];
//     mark: number;
//     category: string;
//     question: string;
//     createdBy: {
//         profilePicture: string;
//         lastName: string;
//         _id: string;
//         firstName: string;
//         fullName: string;
//     };
//     id: number;
//     workshop: string;
//     createdAt: string;
//     updatedAt: string;
//     dueDate: string | null;
//     description?: string;
// }

// const TechnicalTest = () => {
//     const [searchQuery, setSearchQuery] = useState<string>('');
//     const [category, setCategory] = useState<string>('');
//     const [type, setType] = useState<string>('');
//     const [selectedDate, setSelectedDate] = useState<Date | undefined>();
//     const [limit, setLimit] = useState(10);
//     const [currentPage, setCurrentPage] = useState<number>(1);
//     const [isGridView, setIsGridView] = useState<boolean>(true);
//     const [modalOpen, setModalOpen] = useState(false);
//     const [modalMode, setModalMode] = useState<'test' | 'result'>('test');
//     const [selectedTask, setSelectedTask] = useState<Assignment | null>(null);

//     const { data, isLoading } = useGetTechnicalTestsQuery({
//         page: currentPage,
//         limit: limit,
//         workshop: selectedDate || null,
//         category: category,
//         query: searchQuery,
//         type: type,
//         status: '',
//     });

//     const assignments: Assignment[] = data?.assignments || [
//         {
//             _id: '67e083757f128d0019027e57',
//             attachments: [],
//             groups: [],
//             mark: 100,
//             category: 'task',
//             question: 'sdfhgd dgh sg',
//             createdBy: {
//                 profilePicture:
//                     'https://ts4uportal-all-files-upload.nyc3.digitaloceanspaces.com/1719380678611-Screenshot-2024',
//                 lastName: 'Islam',
//                 _id: '64ef676669eaf6370c11429c',
//                 firstName: 'Ashraful',
//                 fullName: 'Ashraful Islam',
//             },
//             id: 311503,
//             workshop: '2025-03-26T21:23:54.000Z',
//             createdAt: '2025-03-23T21:56:05.387Z',
//             updatedAt: '2025-03-23T21:56:05.387Z',
//             dueDate: null,
//         },
//         // ... rest of your assignments data
//     ];

//     const handleTestNowClick = (task: Assignment) => {
//         setModalMode('test');
//         setSelectedTask(task);
//         setModalOpen(true);

//         console.log('clicked');
//     };

//     const handleSeeResultClick = (task: Assignment) => {
//         setModalMode('result');
//         setSelectedTask(task);
//         setModalOpen(true);

//         console.log('clicked');
//     };

//     const defaultColumns: TCustomColumnDef<Assignment>[] = [
//         {
//             accessorKey: 'serial',
//             header: '#ID',
//             cell: ({ row }) => <span>{row.index + 1}</span>,
//             footer: (data) => data.column.id,
//             id: 'serial',
//             visible: true,
//             canHide: true,
//         },
//         {
//             accessorKey: 'question',
//             header: 'Title',
//             cell: ({ row }) => <span>{row.original.question}</span>,
//             footer: (data) => data.column.id,
//             id: 'question',
//             visible: true,
//             canHide: false,
//         },
//         {
//             accessorKey: 'status',
//             header: 'Status',
//             cell: ({ row }) => <StatusBadge status='not_answered' />,
//             footer: (data) => data.column.id,
//             id: 'status',
//             visible: true,
//             canHide: false,
//         },
//         {
//             accessorKey: 'mark',
//             header: 'Total Marks',
//             cell: ({ row }) => <span>{row.original.mark}</span>,
//             footer: (data) => data.column.id,
//             id: 'mark',
//             visible: true,
//             canHide: true,
//         },
//         {
//             accessorKey: 'dueDate',
//             header: 'Deadline',
//             cell: ({ row }) => <TdDate date={row.original.dueDate || ''} />,
//             footer: (data) => data.column.id,
//             id: 'dueDate',
//             visible: true,
//             canHide: false,
//         },
//         {
//             accessorKey: 'workshop',
//             header: 'Workshop',
//             cell: ({ row }) => <TdDate date={row.original.workshop} />,
//             footer: (data) => data.column.id,
//             id: 'workshop',
//             visible: true,
//             canHide: true,
//         },
//         {
//             accessorKey: 'actions',
//             header: 'Actions',
//             cell: ({ row }) => (
//                 <>
//                     <div className='flex items-center gap-2'>
//                         <Button
//                             size='sm'
//                             variant='default'
//                             disabled={false}
//                             onClick={() => handleTestNowClick(row.original)}
//                             className='hover:bg-primary-light rounded-md px-3.5 py-2.5 h-auto'
//                         >
//                             Test Now <span className='ml-1'>→</span>
//                         </Button>
//                         <Button
//                             size='sm'
//                             disabled={false}
//                             onClick={() => handleSeeResultClick(row.original)}
//                             variant='ghost'
//                             className='rounded-md px-3.5 py-2 h-auto flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray '
//                         >
//                             <Eye className='h-5 w-5' />
//                             See Result
//                         </Button>

//                         <TaskModal
//                             isOpen={modalOpen}
//                             onClose={() => setModalOpen(false)}
//                             mode={modalMode}
//                             taskData={{
//                                 id: row.original._id,
//                                 title: row.original.question,
//                                 marks: row.original.mark,
//                                 deadline: row.original.dueDate || '',
//                                 workshop: row.original.workshop,
//                             }}
//                         />
//                     </div>
//                 </>
//             ),
//             footer: (data) => data.column.id,
//             id: 'actions',
//             visible: true,
//             canHide: false,
//         },
//     ];

//     return (
//         <>
//             <GlobalHeader
//                 title='Technical Test'
//                 subTitle='Assess Technical Skills with Accuracy and Speed'
//                 buttons={
//                     <div className='flex items-center gap-2'>
//                         <Button
//                             variant={!isGridView ? 'outline' : 'default'}
//                             onClick={() => setIsGridView(true)}
//                         >
//                             <LayoutGrid size={16} />
//                         </Button>
//                         <Button
//                             variant={isGridView ? 'outline' : 'default'}
//                             onClick={() => setIsGridView(false)}
//                         >
//                             <List size={16} />
//                         </Button>
//                         <FilterModal
//                             value={[]}
//                             columns={[]}
//                             onChange={() => null}
//                         />
//                     </div>
//                 }
//             />
//             <TechnicalMetrics />
//             <Tabs defaultValue='tasks' className='w-full'>
//                 <TabsList className='p-0 bg-transparent'>
//                     <TabsTrigger
//                         value='tasks'
//                         className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent shadow-none'
//                     >
//                         <FileText className='h-5 w-5' />
//                         <span>Technical Task ({assignments.length})</span>
//                     </TabsTrigger>
//                     <TabsTrigger
//                         value='assignments'
//                         className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent shadow-none'
//                     >
//                         <ClipboardList className='h-5 w-5' />
//                         <span>Assignments ({assignments.length})</span>
//                     </TabsTrigger>
//                     <TabsTrigger
//                         value='questions'
//                         className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent shadow-none'
//                     >
//                         <MessageCircleQuestion className='h-5 w-5' />
//                         <span>Technical Question (0)</span>
//                     </TabsTrigger>
//                 </TabsList>

//                 <TabsContent value='tasks' className='mt-2.5'>
//                     {isGridView ? (
//                         <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
//                             {assignments.map((assignment, index) => (
//                                 <TaskCard
//                                     key={index}
//                                     task={{
//                                         id: assignment.id.toString(),
//                                         title: assignment.question,
//                                         marks: assignment.mark,
//                                         deadline: assignment.dueDate || '',
//                                         workshop: assignment.workshop,
//                                         status: 'not_answered',
//                                     }}
//                                 />
//                             ))}
//                         </div>
//                     ) : (
//                         <GlobalTable
//                             isLoading={isLoading}
//                             limit={limit}
//                             data={assignments}
//                             defaultColumns={defaultColumns}
//                             tableName='technical-tasks-table'
//                         />
//                     )}
//                 </TabsContent>

//                 <TabsContent value='assignments' className='mt-2.5'>
//                     {isGridView ? (
//                         <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
//                             {assignments.map((assignment, index) => (
//                                 <TaskCard
//                                     key={index}
//                                     task={{
//                                         id: assignment.id.toString(),
//                                         title: assignment.question,
//                                         marks: assignment.mark,
//                                         deadline: assignment.dueDate || '',
//                                         workshop: assignment.workshop,
//                                         status: 'not_answered',
//                                     }}
//                                 />
//                             ))}
//                         </div>
//                     ) : (
//                         <GlobalTable
//                             isLoading={isLoading}
//                             limit={limit}
//                             data={assignments}
//                             defaultColumns={defaultColumns}
//                             tableName='technical-assignments-table'
//                         />
//                     )}
//                 </TabsContent>

//                 <TabsContent value='questions' className='mt-6'>
//                     <div className='text-center py-10 text-muted-foreground'>
//                         No questions to display.
//                     </div>
//                 </TabsContent>
//             </Tabs>
//             <GlobalPagination
//                 totalItems={assignments.length || 0}
//                 currentPage={currentPage}
//                 itemsPerPage={limit}
//                 onPageChange={(page, newLimit) => {
//                     setCurrentPage(page);
//                     setLimit(newLimit);
//                 }}
//             />
//             {selectedTask && (
//                 <TaskModal
//                     isOpen={modalOpen}
//                     onClose={() => {
//                         setModalOpen(false);
//                         setSelectedTask(null);
//                     }}
//                     mode={modalMode}
//                     taskData={{
//                         id: selectedTask.id.toString(),
//                         title: selectedTask.question,
//                         marks: selectedTask.mark,
//                         deadline: selectedTask.dueDate || '',
//                         workshop: selectedTask.workshop,
//                     }}
//                 />
//             )}
//         </>
//     );
// };

// export default TechnicalTest;
// 'use client';

// import {
//     FileText,
//     ClipboardList,
//     MessageCircleQuestion,
//     LayoutGrid,
//     List,
//     Eye,
// } from 'lucide-react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import TaskCard from './TaskCard';
// import GlobalHeader from '@/components/global/GlobalHeader';
// import { Button } from '@/components/ui/button';
// import { useGetTechnicalTestsQuery } from '@/redux/api/technicalTest/technicalTest';
// import { useState } from 'react';
// import GlobalPagination from '@/components/global/GlobalPagination';
// import TechnicalMetrics from './TechnicalMetrics';
// import FilterModal from '@/components/global/FilterModal/FilterModal';
// import GlobalTable, {
//     TCustomColumnDef,
// } from '@/components/global/GlobalTable/GlobalTable';
// import TdDate from '@/components/global/TdDate';
// import { StatusBadge } from './status-badge';
// import TaskModal from './TaskModal';

// interface Assignment {
//     _id: string;
//     attachments: string[];
//     groups: {
//         activeStatus: { isActive: boolean; activeUntill: string } | null;
//         _id: string;
//         title: string;
//     }[];
//     mark: number;
//     category: string;
//     question: string;
//     createdBy: {
//         profilePicture: string;
//         lastName: string;
//         _id: string;
//         firstName: string;
//         fullName: string;
//     };
//     id: number;
//     workshop: string;
//     createdAt: string;
//     updatedAt: string;
//     dueDate: string | null;
//     description?: string;
// }

// const TechnicalTest = () => {
//     const [searchQuery, setSearchQuery] = useState<string>('');
//     const [category, setCategory] = useState<string>('');
//     const [type, setType] = useState<string>('');
//     const [selectedDate, setSelectedDate] = useState<Date | undefined>();
//     const [limit, setLimit] = useState(10);
//     const [currentPage, setCurrentPage] = useState<number>(1);
//     const [isGridView, setIsGridView] = useState<boolean>(true);
//     const [modalOpen, setModalOpen] = useState(false);
//     const [modalMode, setModalMode] = useState<'test' | 'result'>('test');
//     const [selectedTask, setSelectedTask] = useState<Assignment | null>(null);

//     const { data, isLoading } = useGetTechnicalTestsQuery({
//         page: currentPage,
//         limit: limit,
//         workshop: selectedDate || null,
//         category: category,
//         query: searchQuery,
//         type: type,
//         status: '',
//     });

//     const assignments: Assignment[] = data?.assignments || [];
//     const totalItems = assignments.length || 0;
//     const totalPages = Math.ceil(totalItems / limit);

//     const handleTestNowClick = (task: Assignment) => {
//         setModalMode('test');
//         setSelectedTask(task);
//         setModalOpen(true);
//     };

//     const handleSeeResultClick = (task: Assignment) => {
//         setModalMode('result');
//         setSelectedTask(task);
//         setModalOpen(true);
//     };

//     const handlePageChange = (page: number, newLimit?: number) => {
//         const validPage = Math.max(1, Math.min(page, totalPages));
//         setCurrentPage(validPage);

//         if (newLimit) {
//             setLimit(newLimit);
//             const newStartIndex = (validPage - 1) * newLimit;
//             const newCurrentPage = Math.floor(newStartIndex / newLimit) + 1;
//             setCurrentPage(newCurrentPage);
//         }
//     };

//     const defaultColumns: TCustomColumnDef<Assignment>[] = [
//         {
//             accessorKey: 'serial',
//             header: '#ID',
//             cell: ({ row }) => <span>{row.index + 1}</span>,
//             footer: (data) => data.column.id,
//             id: 'serial',
//             visible: true,
//             canHide: true,
//         },
//         {
//             accessorKey: 'question',
//             header: 'Title',
//             cell: ({ row }) => <span>{row.original.question}</span>,
//             footer: (data) => data.column.id,
//             id: 'question',
//             visible: true,
//             canHide: false,
//         },
//         {
//             accessorKey: 'status',
//             header: 'Status',
//             cell: ({ row }) => <StatusBadge status='not_answered' />,
//             footer: (data) => data.column.id,
//             id: 'status',
//             visible: true,
//             canHide: false,
//         },
//         {
//             accessorKey: 'mark',
//             header: 'Total Marks',
//             cell: ({ row }) => <span>{row.original.mark}</span>,
//             footer: (data) => data.column.id,
//             id: 'mark',
//             visible: true,
//             canHide: true,
//         },
//         {
//             accessorKey: 'dueDate',
//             header: 'Deadline',
//             cell: ({ row }) => <TdDate date={row.original.dueDate || ''} />,
//             footer: (data) => data.column.id,
//             id: 'dueDate',
//             visible: true,
//             canHide: false,
//         },
//         {
//             accessorKey: 'workshop',
//             header: 'Workshop',
//             cell: ({ row }) => <TdDate date={row.original.workshop} />,
//             footer: (data) => data.column.id,
//             id: 'workshop',
//             visible: true,
//             canHide: true,
//         },
//         {
//             accessorKey: 'actions',
//             header: 'Actions',
//             cell: ({ row }) => (
//                 <div className='flex items-center gap-2'>
//                     <Button
//                         size='sm'
//                         variant='default'
//                         disabled={false}
//                         onClick={() => handleTestNowClick(row.original)}
//                         className='hover:bg-primary-light rounded-md px-3.5 py-2.5 h-auto'
//                     >
//                         Test Now <span className='ml-1'>→</span>
//                     </Button>
//                     <Button
//                         size='sm'
//                         disabled={false}
//                         onClick={() => handleSeeResultClick(row.original)}
//                         variant='ghost'
//                         className='rounded-md px-3.5 py-2 h-auto flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray'
//                     >
//                         <Eye className='h-5 w-5' />
//                         See Result
//                     </Button>
//                 </div>
//             ),
//             footer: (data) => data.column.id,
//             id: 'actions',
//             visible: true,
//             canHide: false,
//         },
//     ];

//     return (
//         <div className='h-[calc(100vh-120px)] flex flex-col justify-between'>
//             <div>
//                 <GlobalHeader
//                     title='Technical Test'
//                     subTitle='Assess Technical Skills with Accuracy and Speed'
//                     buttons={
//                         <div className='flex items-center gap-2'>
//                             <Button
//                                 variant={!isGridView ? 'outline' : 'default'}
//                                 onClick={() => setIsGridView(true)}
//                             >
//                                 <LayoutGrid size={16} />
//                             </Button>
//                             <Button
//                                 variant={isGridView ? 'outline' : 'default'}
//                                 onClick={() => setIsGridView(false)}
//                             >
//                                 <List size={16} />
//                             </Button>
//                             <FilterModal
//                                 value={[]}
//                                 columns={[]}
//                                 onChange={() => null}
//                             />
//                         </div>
//                     }
//                 />
//                 <TechnicalMetrics />
//                 <Tabs defaultValue='tasks' className='w-full'>
//                     <TabsList className='p-0 bg-transparent'>
//                         <TabsTrigger
//                             value='tasks'
//                             className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent shadow-none'
//                         >
//                             <FileText className='h-5 w-5' />
//                             <span>Technical Task ({assignments.length})</span>
//                         </TabsTrigger>
//                         <TabsTrigger
//                             value='assignments'
//                             className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent shadow-none'
//                         >
//                             <ClipboardList className='h-5 w-5' />
//                             <span>Assignments ({assignments.length})</span>
//                         </TabsTrigger>
//                         <TabsTrigger
//                             value='questions'
//                             className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent shadow-none'
//                         >
//                             <MessageCircleQuestion className='h-5 w-5' />
//                             <span>Technical Question (0)</span>
//                         </TabsTrigger>
//                     </TabsList>

//                     <TabsContent value='tasks' className='mt-2.5'>
//                         {isGridView ? (
//                             <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
//                                 {assignments.map((assignment, index) => (
//                                     <TaskCard
//                                         key={index}
//                                         task={{
//                                             id: assignment.id.toString(),
//                                             title: assignment.question,
//                                             marks: assignment.mark,
//                                             deadline: assignment.dueDate || '',
//                                             workshop: assignment.workshop,
//                                             status: 'not_answered',
//                                         }}
//                                     />
//                                 ))}
//                             </div>
//                         ) : (
//                             <GlobalTable
//                                 isLoading={isLoading}
//                                 limit={limit}
//                                 data={assignments}
//                                 defaultColumns={defaultColumns}
//                                 tableName='technical-tasks-table'
//                             />
//                         )}
//                     </TabsContent>

//                     <TabsContent value='assignments' className='mt-2.5'>
//                         {isGridView ? (
//                             <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
//                                 {assignments.map((assignment, index) => (
//                                     <TaskCard
//                                         key={index}
//                                         task={{
//                                             id: assignment.id.toString(),
//                                             title: assignment.question,
//                                             marks: assignment.mark,
//                                             deadline: assignment.dueDate || '',
//                                             workshop: assignment.workshop,
//                                             status: 'not_answered',
//                                         }}
//                                     />
//                                 ))}
//                             </div>
//                         ) : (
//                             <GlobalTable
//                                 isLoading={isLoading}
//                                 limit={limit}
//                                 data={assignments}
//                                 defaultColumns={defaultColumns}
//                                 tableName='technical-assignments-table'
//                             />
//                         )}
//                     </TabsContent>

//                     <TabsContent value='questions' className='mt-6'>
//                         <div className='text-center py-10 text-muted-foreground'>
//                             No questions to display.
//                         </div>
//                     </TabsContent>
//                 </Tabs>
//             </div>

//             <GlobalPagination
//                 totalItems={totalItems}
//                 currentPage={currentPage}
//                 itemsPerPage={limit}
//                 onPageChange={handlePageChange}
//             />

//             {selectedTask && (
//                 <TaskModal
//                     isOpen={modalOpen}
//                     onClose={() => {
//                         setModalOpen(false);
//                         setSelectedTask(null);
//                     }}
//                     mode={modalMode}
//                     taskData={{
//                         id: selectedTask.id.toString(),
//                         title: selectedTask.question,
//                         marks: selectedTask.mark,
//                         deadline: selectedTask.dueDate || '',
//                         workshop: selectedTask.workshop,
//                     }}
//                 />
//             )}
//         </div>
//     );
// };

// export default TechnicalTest;
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
import { useState } from 'react';
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
            visible: true,
            canHide: true,
        },
        {
            accessorKey: 'question',
            header: 'Title',
            cell: ({ row }) => <span>{row.original.question}</span>,
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
            header: 'Total Marks',
            cell: ({ row }) => <span>{row.original.mark}</span>,
            footer: (data) => data.column.id,
            id: 'mark',
            visible: true,
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
            visible: true,
            canHide: true,
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className='flex items-center gap-2'>
                    <Button
                        size='sm'
                        variant='default'
                        disabled={false}
                        onClick={() => handleTestNowClick(row.original)}
                        className='hover:bg-primary-light rounded-md px-3.5 py-2.5 h-auto'
                    >
                        Test Now <span className='ml-1'>→</span>
                    </Button>
                    <Button
                        size='sm'
                        disabled={false}
                        onClick={() => handleSeeResultClick(row.original)}
                        variant='ghost'
                        className='rounded-md px-3.5 py-2 h-auto flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray'
                    >
                        <Eye className='h-5 w-5' />
                        See Result
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
        <div className='h-[calc(100vh-120px)] flex flex-col justify-between'>
            <div>
                <GlobalHeader
                    title='Technical Test'
                    subTitle='Assess Technical Skills with Accuracy and Speed'
                    buttons={
                        <div className='flex items-center gap-2'>
                            <Button
                                variant={!isGridView ? 'outline' : 'default'}
                                onClick={() => setIsGridView(true)}
                            >
                                <LayoutGrid size={16} />
                            </Button>
                            <Button
                                variant={isGridView ? 'outline' : 'default'}
                                onClick={() => setIsGridView(false)}
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
                    <TabsList className='p-0 bg-transparent'>
                        <TabsTrigger
                            value='tasks'
                            className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent shadow-none'
                        >
                            <FileText className='h-5 w-5' />
                            <span>Technical Task ({assignments.length})</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value='assignments'
                            className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent shadow-none'
                        >
                            <ClipboardList className='h-5 w-5' />
                            <span>Assignments ({assignments.length})</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value='questions'
                            className='data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-b-primary-white rounded-none data-[state=active]:bg-transparent shadow-none'
                        >
                            <MessageCircleQuestion className='h-5 w-5' />
                            <span>Technical Question (0)</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value='tasks' className='mt-2.5'>
                        {isGridView ? (
                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
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
                            <GlobalTable
                                isLoading={isLoading}
                                limit={limit}
                                data={assignments}
                                defaultColumns={defaultColumns}
                                tableName='technical-tasks-table'
                            />
                        )}
                    </TabsContent>

                    <TabsContent value='assignments' className='mt-2.5'>
                        {isGridView ? (
                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
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
                            <GlobalTable
                                isLoading={isLoading}
                                limit={limit}
                                data={assignments}
                                defaultColumns={defaultColumns}
                                tableName='technical-assignments-table'
                            />
                        )}
                    </TabsContent>

                    <TabsContent value='questions' className='mt-6'>
                        <div className='text-center py-10 text-muted-foreground'>
                            No questions to display.
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <GlobalPagination
                totalItems={totalItems}
                currentPage={currentPage}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
            />

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
