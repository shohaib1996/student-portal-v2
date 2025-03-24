'use client';

import { useState } from 'react';
import { X, ArrowRight, Check, Star } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { UniversitySelectModal } from './university-select-modal';

interface University {
    id: string;
    name: string;
    description: string;
    image: string;
    status: 'active' | 'pending' | 'inactive';
    date: string;
    time: string;
}

interface Program {
    id: string;
    title: string;
    image: string;
    status: 'approved' | 'pending' | 'cancelled';
    organization: string;
    instructor: string;
    instructorImage: string;
    date: string;
    time: string;
    totalFee: number;
    paid: number;
    due: number;
    rating: number;
    progress: number;
}

interface ProgramSelectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedUniversity?: University;
    onSelectProgram?: (program: Program) => void;
    onChangeUniversity?: () => void;
}

export function ProgramSelectModal({
    open,
    onOpenChange,
    selectedUniversity,
    onSelectProgram,
    onChangeUniversity,
}: ProgramSelectModalProps) {
    const [isUniversityModalOpen, setIsUniversityModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('program');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProgram, setSelectedProgram] = useState<string>('1');
    const [setAsDefault, setSetAsDefault] = useState(false);

    const [programs] = useState<Program[]>([
        {
            id: '1',
            title: 'AWS DevOps and CloudOps Engineer',
            image: '/placeholder.svg?height=80&width=80',
            status: 'approved',
            organization: 'TS4U/IT Engineer Bootcamps',
            instructor: 'Org With Logo',
            instructorImage: '/placeholder.svg?height=24&width=24',
            date: 'Jan 30, 2024',
            time: '12:30 PM',
            totalFee: 12000,
            paid: 8000,
            due: 4000,
            rating: 5.0,
            progress: 35,
        },
        {
            id: '2',
            title: 'Project/Product Manager',
            image: '/placeholder.svg?height=80&width=80',
            status: 'approved',
            organization: 'TS4U/IT Engineer Bootcamps',
            instructor: 'Org With Logo',
            instructorImage: '/placeholder.svg?height=24&width=24',
            date: 'Jan 30, 2024',
            time: '12:30 PM',
            totalFee: 12000,
            paid: 8000,
            due: 4000,
            rating: 5.0,
            progress: 55,
        },
        {
            id: '3',
            title: 'MERN Full Stack Software Developer',
            image: '/placeholder.svg?height=80&width=80',
            status: 'pending',
            organization: 'TS4U/IT Engineer Bootcamps',
            instructor: 'Org With Logo',
            instructorImage: '/placeholder.svg?height=24&width=24',
            date: 'Jan 30, 2024',
            time: '12:30 PM',
            totalFee: 12000,
            paid: 8000,
            due: 4000,
            rating: 5.0,
            progress: 0,
        },
        {
            id: '4',
            title: 'Software Quality Assurance (SQA)',
            image: '/placeholder.svg?height=80&width=80',
            status: 'cancelled',
            organization: 'TS4U/IT Engineer Bootcamps',
            instructor: 'Org With Logo',
            instructorImage: '/placeholder.svg?height=24&width=24',
            date: 'Jan 30, 2024',
            time: '12:30 PM',
            totalFee: 12000,
            paid: 8000,
            due: 4000,
            rating: 5.0,
            progress: 0,
        },
        {
            id: '5',
            title: 'AWS DevOps and CloudOps Engineer',
            image: '/placeholder.svg?height=80&width=80',
            status: 'approved',
            organization: 'TS4U/IT Engineer Bootcamps',
            instructor: 'Org With Logo',
            instructorImage: '/placeholder.svg?height=24&width=24',
            date: 'Jan 30, 2024',
            time: '12:30 PM',
            totalFee: 12000,
            paid: 8000,
            due: 4000,
            rating: 5.0,
            progress: 65,
        },
    ]);

    const handleSelectProgram = (id: string) => {
        setSelectedProgram(id);
        const selected = programs.find((prog) => prog.id === id);
        if (selected && onSelectProgram) {
            onSelectProgram(selected);
        }
    };

    const handleChangeUniversity = () => {
        if (onChangeUniversity) {
            onChangeUniversity();
        } else {
            setIsUniversityModalOpen(true);
        }
    };

    const filteredPrograms = programs.filter((prog) =>
        prog.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        })
            .format(amount)
            .replace('.00', '');
    };

    const renderStars = (rating: number) => {
        return Array(5)
            .fill(0)
            .map((_, i) => (
                <Star
                    key={i}
                    className={cn(
                        'w-3 h-3 fill-current',
                        i < Math.floor(rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300',
                    )}
                />
            ));
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className='sm:max-w-[550px] p-6 overflow-hidden'>
                    <div className='absolute right-4 top-4'>
                        <button
                            className='rounded-full h-6 w-6 inline-flex items-center justify-center bg-[#f34141] text-white hover:bg-[#f34141]/90 transition-colors'
                            onClick={() => onOpenChange(false)}
                        >
                            <X className='h-4 w-4' />
                        </button>
                    </div>

                    <div className='space-y-6'>
                        <div>
                            <h2 className='text-xl font-semibold'>
                                Select Program/Course
                            </h2>
                            <p className='text-sm text-muted-foreground'>
                                Choose a program or course to advance your
                                journey
                            </p>
                        </div>

                        {selectedUniversity && (
                            <div className='border rounded-lg p-3 flex gap-3'>
                                <div className='flex-shrink-0'>
                                    <Image
                                        src={
                                            selectedUniversity.image ||
                                            '/placeholder.svg'
                                        }
                                        alt={selectedUniversity.name}
                                        width={80}
                                        height={80}
                                        className='rounded-md object-cover'
                                    />
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <div className='flex items-center gap-2'>
                                        <h3 className='text-sm font-medium'>
                                            {selectedUniversity.name}
                                        </h3>
                                        {selectedUniversity.status ===
                                            'active' && (
                                            <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800'>
                                                <Check className='w-3 h-3 mr-1' />{' '}
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                                        {selectedUniversity.description}
                                    </p>
                                    <div className='flex items-center mt-2 text-xs text-muted-foreground'>
                                        <svg
                                            className='w-3 h-3 mr-1'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            xmlns='http://www.w3.org/2000/svg'
                                        >
                                            <path
                                                d='M8 2V5'
                                                stroke='currentColor'
                                                strokeWidth='1.5'
                                                strokeMiterlimit='10'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                            <path
                                                d='M16 2V5'
                                                stroke='currentColor'
                                                strokeWidth='1.5'
                                                strokeMiterlimit='10'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                            <path
                                                d='M3.5 9.09H20.5'
                                                stroke='currentColor'
                                                strokeWidth='1.5'
                                                strokeMiterlimit='10'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                            <path
                                                d='M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z'
                                                stroke='currentColor'
                                                strokeWidth='1.5'
                                                strokeMiterlimit='10'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                        </svg>
                                        {selectedUniversity.date} |{' '}
                                        {selectedUniversity.time}
                                    </div>
                                </div>
                                <div className='flex items-center'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        className='text-xs h-8'
                                        onClick={handleChangeUniversity}
                                    >
                                        Change Company
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className='relative'>
                            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                                <svg
                                    className='w-4 h-4 text-gray-500'
                                    aria-hidden='true'
                                    xmlns='http://www.w3.org/2000/svg'
                                    fill='none'
                                    viewBox='0 0 20 20'
                                >
                                    <path
                                        stroke='currentColor'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth='2'
                                        d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z'
                                    />
                                </svg>
                            </div>
                            <Input
                                className='pl-10'
                                placeholder='Search program/course...'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Tabs
                            defaultValue='program'
                            value={activeTab}
                            onValueChange={setActiveTab}
                        >
                            <TabsList className='grid w-full grid-cols-3'>
                                <TabsTrigger
                                    value='program'
                                    className='text-xs'
                                >
                                    <svg
                                        className='w-4 h-4 mr-1'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <path
                                            d='M10.05 2.53L4.03 6.46C2.1 7.72 2.1 10.54 4.03 11.8L10.05 15.73C11.13 16.44 12.91 16.44 13.99 15.73L19.98 11.8C21.9 10.54 21.9 7.73 19.98 6.47L13.99 2.54C12.91 1.82 11.13 1.82 10.05 2.53Z'
                                            stroke='currentColor'
                                            strokeWidth='1.5'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                        <path
                                            d='M5.63 13.08L5.62 17.77C5.62 19.04 6.6 20.4 7.8 20.8L10.99 21.86C11.54 22.04 12.45 22.04 13.01 21.86L16.2 20.8C17.4 20.4 18.38 19.04 18.38 17.77V13.13'
                                            stroke='currentColor'
                                            strokeWidth='1.5'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                        <path
                                            d='M21.4 15V9'
                                            stroke='currentColor'
                                            strokeWidth='1.5'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                    Program (12)
                                </TabsTrigger>
                                <TabsTrigger
                                    value='courses'
                                    className='text-xs'
                                >
                                    <svg
                                        className='w-4 h-4 mr-1'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <path
                                            d='M22 16.74V4.67C22 3.47 21.02 2.58 19.83 2.68H19.77C17.67 2.86 14.48 3.93 12.7 5.05L12.53 5.16C12.24 5.34 11.76 5.34 11.47 5.16L11.22 5.01C9.44 3.9 6.26 2.84 4.16 2.67C2.97 2.57 2 3.47 2 4.66V16.74C2 17.7 2.78 18.6 3.74 18.72L4.03 18.76C6.2 19.05 9.55 20.15 11.47 21.2L11.51 21.22C11.78 21.37 12.21 21.37 12.47 21.22C14.39 20.16 17.75 19.05 19.93 18.76L20.26 18.72C21.22 18.6 22 17.7 22 16.74Z'
                                            stroke='currentColor'
                                            strokeWidth='1.5'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                        <path
                                            d='M12 5.49V20.49'
                                            stroke='currentColor'
                                            strokeWidth='1.5'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                        <path
                                            d='M7.75 8.49H5.5'
                                            stroke='currentColor'
                                            strokeWidth='1.5'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                        <path
                                            d='M8.5 11.49H5.5'
                                            stroke='currentColor'
                                            strokeWidth='1.5'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                    Courses (12)
                                </TabsTrigger>
                                <TabsTrigger
                                    value='interviews'
                                    className='text-xs'
                                >
                                    <svg
                                        className='w-4 h-4 mr-1'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <path
                                            d='M8.5 19H8C4 19 2 18 2 13V8C2 4 4 2 8 2H16C20 2 22 4 22 8V13C22 17 20 19 16 19H15.5C15.19 19 14.89 19.15 14.7 19.4L13.2 21.4C12.54 22.28 11.46 22.28 10.8 21.4L9.3 19.4C9.14 19.18 8.77 19 8.5 19Z'
                                            stroke='currentColor'
                                            strokeWidth='1.5'
                                            strokeMiterlimit='10'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                        <path
                                            d='M15.9965 11H16.0054'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                        <path
                                            d='M11.9955 11H12.0045'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                        <path
                                            d='M7.99451 11H8.00349'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                    Interviews (8)
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent
                                value='program'
                                className='space-y-3 max-h-[400px] overflow-y-auto pr-1 mt-4'
                            >
                                {filteredPrograms.map((program) => (
                                    <div
                                        key={program.id}
                                        className={cn(
                                            'border rounded-lg p-3',
                                            selectedProgram === program.id &&
                                                'border-[#0736d1]',
                                        )}
                                    >
                                        <div className='flex gap-3'>
                                            <div className='flex-shrink-0 relative'>
                                                <Image
                                                    src={
                                                        program.image ||
                                                        '/placeholder.svg'
                                                    }
                                                    alt={program.title}
                                                    width={80}
                                                    height={80}
                                                    className='rounded-md object-cover'
                                                />
                                                <div className='absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-0.5'>
                                                    {program.rating.toFixed(1)}
                                                </div>
                                            </div>
                                            <div className='flex-1 min-w-0'>
                                                <div className='flex items-center gap-2 flex-wrap'>
                                                    <h3 className='text-sm font-medium'>
                                                        {program.title}
                                                    </h3>
                                                    {program.status ===
                                                        'approved' && (
                                                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800'>
                                                            <Check className='w-3 h-3 mr-1' />{' '}
                                                            Approved
                                                        </span>
                                                    )}
                                                    {program.status ===
                                                        'pending' && (
                                                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800'>
                                                            <svg
                                                                className='w-3 h-3 mr-1'
                                                                viewBox='0 0 24 24'
                                                                fill='none'
                                                                xmlns='http://www.w3.org/2000/svg'
                                                            >
                                                                <path
                                                                    d='M12 8V12'
                                                                    stroke='currentColor'
                                                                    strokeWidth='2'
                                                                    strokeLinecap='round'
                                                                />
                                                                <path
                                                                    d='M12 16V16.01'
                                                                    stroke='currentColor'
                                                                    strokeWidth='2'
                                                                    strokeLinecap='round'
                                                                />
                                                                <path
                                                                    d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
                                                                    stroke='currentColor'
                                                                    strokeWidth='2'
                                                                />
                                                            </svg>
                                                            Pending
                                                        </span>
                                                    )}
                                                    {program.status ===
                                                        'cancelled' && (
                                                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800'>
                                                            <X className='w-3 h-3 mr-1' />{' '}
                                                            Cancelled
                                                        </span>
                                                    )}
                                                </div>

                                                <div className='flex items-center mt-1 gap-1'>
                                                    <div className='text-xs text-muted-foreground'>
                                                        {program.organization}
                                                    </div>
                                                </div>

                                                <div className='flex items-center mt-1 gap-2'>
                                                    <div className='flex items-center gap-1'>
                                                        <Image
                                                            src={
                                                                program.instructorImage ||
                                                                '/placeholder.svg'
                                                            }
                                                            alt={
                                                                program.instructor
                                                            }
                                                            width={16}
                                                            height={16}
                                                            className='rounded-full'
                                                        />
                                                        <span className='text-xs text-muted-foreground'>
                                                            {program.instructor}
                                                        </span>
                                                    </div>
                                                    <div className='text-xs text-muted-foreground flex items-center'>
                                                        <svg
                                                            className='w-3 h-3 mr-1'
                                                            viewBox='0 0 24 24'
                                                            fill='none'
                                                            xmlns='http://www.w3.org/2000/svg'
                                                        >
                                                            <path
                                                                d='M8 2V5'
                                                                stroke='currentColor'
                                                                strokeWidth='1.5'
                                                                strokeMiterlimit='10'
                                                                strokeLinecap='round'
                                                                strokeLinejoin='round'
                                                            />
                                                            <path
                                                                d='M16 2V5'
                                                                stroke='currentColor'
                                                                strokeWidth='1.5'
                                                                strokeMiterlimit='10'
                                                                strokeLinecap='round'
                                                                strokeLinejoin='round'
                                                            />
                                                            <path
                                                                d='M3.5 9.09H20.5'
                                                                stroke='currentColor'
                                                                strokeWidth='1.5'
                                                                strokeMiterlimit='10'
                                                                strokeLinecap='round'
                                                                strokeLinejoin='round'
                                                            />
                                                            <path
                                                                d='M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z'
                                                                stroke='currentColor'
                                                                strokeWidth='1.5'
                                                                strokeMiterlimit='10'
                                                                strokeLinecap='round'
                                                                strokeLinejoin='round'
                                                            />
                                                        </svg>
                                                        {program.date} |{' '}
                                                        {program.time}
                                                    </div>
                                                </div>

                                                <div className='grid grid-cols-3 gap-2 mt-2'>
                                                    <div>
                                                        <div className='text-xs text-muted-foreground'>
                                                            Total Fee
                                                        </div>
                                                        <div className='text-xs font-medium'>
                                                            {formatCurrency(
                                                                program.totalFee,
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className='text-xs text-muted-foreground'>
                                                            Paid
                                                        </div>
                                                        <div className='text-xs font-medium text-green-600'>
                                                            {formatCurrency(
                                                                program.paid,
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className='text-xs text-muted-foreground'>
                                                            Due
                                                        </div>
                                                        <div className='text-xs font-medium text-amber-600'>
                                                            {formatCurrency(
                                                                program.due,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='flex items-center gap-2 mt-2'>
                                                    <div className='flex'>
                                                        {renderStars(
                                                            program.rating,
                                                        )}
                                                    </div>
                                                    <div className='text-xs text-muted-foreground'>
                                                        (
                                                        {program.rating.toFixed(
                                                            1,
                                                        )}
                                                        )
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='flex flex-col items-end justify-between'>
                                                <div className='relative h-12 w-12'>
                                                    <svg
                                                        viewBox='0 0 36 36'
                                                        className='h-12 w-12 -rotate-90'
                                                    >
                                                        <path
                                                            d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                                                            fill='none'
                                                            stroke='#eee'
                                                            strokeWidth='3'
                                                            strokeDasharray='100, 100'
                                                        />
                                                        <path
                                                            d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                                                            fill='none'
                                                            stroke={
                                                                program.progress >
                                                                0
                                                                    ? '#0736d1'
                                                                    : '#eee'
                                                            }
                                                            strokeWidth='3'
                                                            strokeDasharray={`${program.progress}, 100`}
                                                        />
                                                    </svg>
                                                    <div className='absolute inset-0 flex items-center justify-center text-xs font-medium'>
                                                        {program.progress}%
                                                    </div>
                                                </div>

                                                {selectedProgram ===
                                                program.id ? (
                                                    <div className='px-4 py-1.5 rounded bg-[#e6ebfa] text-[#0736d1] text-xs font-medium flex items-center'>
                                                        <Check className='w-3 h-3 mr-1' />{' '}
                                                        Selected
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant='outline'
                                                        className={cn(
                                                            'px-4 py-1 h-auto text-xs',
                                                            program.status ===
                                                                'approved'
                                                                ? 'bg-[#0736d1] text-white hover:bg-[#0736d1]/90'
                                                                : 'bg-gray-100 text-gray-500',
                                                        )}
                                                        onClick={() =>
                                                            handleSelectProgram(
                                                                program.id,
                                                            )
                                                        }
                                                        disabled={
                                                            program.status !==
                                                            'approved'
                                                        }
                                                    >
                                                        Switch to Program{' '}
                                                        <ArrowRight className='ml-1 h-3 w-3' />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </TabsContent>
                            <TabsContent value='courses' className='mt-4'>
                                <div className='flex items-center justify-center h-40 border rounded-md'>
                                    <p className='text-muted-foreground'>
                                        Courses content will appear here
                                    </p>
                                </div>
                            </TabsContent>
                            <TabsContent value='interviews' className='mt-4'>
                                <div className='flex items-center justify-center h-40 border rounded-md'>
                                    <p className='text-muted-foreground'>
                                        Interviews content will appear here
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className='flex items-center space-x-2'>
                            <Checkbox
                                id='default-program'
                                checked={setAsDefault}
                                onCheckedChange={(checked) =>
                                    setSetAsDefault(checked as boolean)
                                }
                            />
                            <label
                                htmlFor='default-program'
                                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                            >
                                Set this selected program as the default
                            </label>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <UniversitySelectModal
                open={isUniversityModalOpen}
                onOpenChange={setIsUniversityModalOpen}
            />
        </>
    );
}
