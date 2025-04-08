'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    X,
    ArrowRight,
    Check,
    Star,
    CalendarDays,
    Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import GlobalModal from '../global/GlobalModal'; // Adjust path as needed
import { setEnrollment } from '@/redux/features/auth/authReducer';
import storage from '@/utils/storage';
import { toast } from 'sonner';
import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import Cookies from 'js-cookie';
import { setActiveCompany } from '@/redux/features/comapnyReducer';
import { UniversitySelectModal } from '../global/SelectModal/university-select-modal';

interface Enrollment {
    _id: string;
    status: string;
    program: {
        title: string;
        instructor: {
            name: string;
            image: string;
        };
    };
    session: {
        name: string;
    };
    organization: {
        name: string;
    };
    image?: string;
    date?: string;
    time?: string;
    totalFee?: number;
    paid?: number;
    due?: number;
    rating?: number;
    progress?: number;
}

interface Company {
    _id: string;
    name: string;
    description?: string;
    image?: string;
    status?: 'active' | 'pending' | 'inactive';
    date?: string;
    time?: string;
}

interface SwitchModalProps {
    opened: boolean;
    handleClose: () => void;
}

export function SwitchModal({ opened, handleClose }: SwitchModalProps) {
    const dispatch = useDispatch();

    const { myEnrollments } = useAppSelector((state) => state.auth);

    const { companies, activeCompany } = useSelector(
        (state: RootState) => state.company,
    );

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
        null,
    );
    const [setAsDefault, setSetAsDefault] = useState(false);
    const [activeTab, setActiveTab] = useState('program');
    const [isUniversityModalOpen, setIsUniversityModalOpen] = useState(false);

    // Get the selected university based on activeCompany from Redux or cookies
    const selectedUniversity: any = companies.find(
        (company) =>
            company._id === (activeCompany || Cookies.get('activeCompany')),
    );

    // Automatically select the active bootcamp from storage when the modal opens
    useEffect(() => {
        if (opened) {
            const activeEnrollment = storage.getItem('active_enrolment');
            if (activeEnrollment && activeEnrollment._id) {
                const matchingEnrollment = myEnrollments.find(
                    (enroll) => enroll._id === activeEnrollment._id,
                );
                if (matchingEnrollment) {
                    setSelectedProgramId(matchingEnrollment._id); // Automatically select the active bootcamp
                } else {
                    setSelectedProgramId(null);
                }
            } else {
                setSelectedProgramId(null);
            }
        }
    }, [opened, myEnrollments]);

    const handleSelectProgram = (id: string) => {
        setSelectedProgramId(id);
    };

    const handleSwitch = async () => {
        const selected = myEnrollments.find(
            (enroll) => enroll._id === selectedProgramId,
        );
        if (selected) {
            dispatch(setEnrollment(selected));
            await storage.setItem('active_enrolment', selected);
            handleClose();
            toast.success(`Switched to ${selected.program.title}`);
            window.location.href = '/dashboard/program';
        }
    };

    const handleChangeUniversity = () => {
        setIsUniversityModalOpen(true);
    };

    const handleSelectUniversity = (company: Company) => {
        dispatch(setActiveCompany(company));
        Cookies.set('activeCompany', company._id);
        setIsUniversityModalOpen(false);
        // Optionally reload or fetch new enrollments based on the new company
        setTimeout(() => window.location.reload(), 1000);
    };

    const filteredEnrollments = myEnrollments.filter((enroll) =>
        enroll.program.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const formatCurrency = (amount: number = 0) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        })
            .format(amount)
            .replace('.00', '');
    };

    const renderStars = (rating: number = 0) => {
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
            <GlobalModal
                open={opened}
                setOpen={handleClose}
                title='Switch Bootcamp'
                subTitle="If you wish to change to another program, please click on 'Switch' and proceed."
                className='w-full max-w-4xl bg-foreground'
                allowFullScreen={false}
            >
                <div className='space-y-6 py-3'>
                    {selectedUniversity && (
                        <div className='border rounded-lg p-3 flex gap-3 bg-background'>
                            <div className='flex-shrink-0'>
                                <Image
                                    src={
                                        selectedUniversity.image ||
                                        '/images/university-thumbnail.png'
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
                                    {selectedUniversity.status === 'active' && (
                                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800'>
                                            <Check className='w-3 h-3 mr-1' />{' '}
                                            Active
                                        </span>
                                    )}
                                </div>
                                <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                                    {selectedUniversity.description ||
                                        'No description available.'}
                                </p>
                                <div className='flex flex-row gap-1 items-center mt-2 text-xs text-muted-foreground'>
                                    <Calendar size={14} />
                                    {selectedUniversity.date ??
                                        'Dec 16, 1971'}{' '}
                                    | {selectedUniversity.time ?? '12:12AM'}
                                </div>
                            </div>
                            <div className='flex items-center'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    className='text-xs h-8 bg-foreground'
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
                            placeholder='Search programs...'
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
                            <TabsTrigger value='program' className='text-xs'>
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
                                Programs ({myEnrollments.length})
                            </TabsTrigger>
                            <TabsTrigger value='courses' className='text-xs'>
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
                                Courses (0)
                            </TabsTrigger>
                            <TabsTrigger value='interviews' className='text-xs'>
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
                                Interviews (0)
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent
                            value='program'
                            className='space-y-3 max-h-[400px] overflow-y-auto pr-1 mt-4'
                        >
                            {filteredEnrollments.length === 0 ? (
                                <div className='text-center py-8'>
                                    <h2 className='text-xl font-semibold'>
                                        No enrollment found
                                    </h2>
                                </div>
                            ) : (
                                filteredEnrollments.map((enroll) => (
                                    <div
                                        key={enroll._id}
                                        className={cn(
                                            'border rounded-lg p-3 bg-background',
                                            selectedProgramId === enroll._id &&
                                                'border-[#0736d1]',
                                        )}
                                    >
                                        <div className='flex gap-3'>
                                            <div className='flex-shrink-0 relative'>
                                                <Image
                                                    src={
                                                        enroll.image ||
                                                        enroll.program
                                                            .instructor.image ||
                                                        '/default_image.png'
                                                    }
                                                    alt={enroll.program.title}
                                                    width={200}
                                                    height={200}
                                                    className='rounded-md object-cover h-[80px] w-[80px]'
                                                />
                                                <div className='absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-0.5'>
                                                    {(
                                                        enroll.rating || 0
                                                    ).toFixed(1)}
                                                </div>
                                            </div>
                                            <div className='flex-1 min-w-0'>
                                                <div className='flex items-center gap-2 flex-wrap'>
                                                    <h3 className='text-sm font-medium'>
                                                        {enroll.program.title}
                                                    </h3>
                                                    {enroll.status ===
                                                        'approved' && (
                                                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800'>
                                                            <Check className='w-3 h-3 mr-1' />{' '}
                                                            Approved
                                                        </span>
                                                    )}
                                                    {enroll.status ===
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
                                                    {enroll.status ===
                                                        'trial' && (
                                                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
                                                            <Check className='w-3 h-3 mr-1' />{' '}
                                                            Trial
                                                        </span>
                                                    )}
                                                </div>

                                                <div className='flex items-center mt-1 gap-1'>
                                                    <div className='text-xs text-muted-foreground'>
                                                        {
                                                            enroll.organization
                                                                .name
                                                        }
                                                    </div>
                                                </div>

                                                <div className='flex items-center mt-1 gap-2'>
                                                    <div className='flex items-center gap-1'>
                                                        <Image
                                                            src={
                                                                enroll.program
                                                                    .instructor
                                                                    .image ||
                                                                '/avatar.png'
                                                            }
                                                            alt={
                                                                enroll.program
                                                                    .instructor
                                                                    .name
                                                            }
                                                            width={100}
                                                            height={100}
                                                            className='rounded-full h-4 w-4'
                                                        />
                                                        <span className='text-xs text-muted-foreground'>
                                                            {
                                                                enroll.program
                                                                    .instructor
                                                                    .name
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className='text-xs text-muted-foreground flex items-center gap-1'>
                                                        <CalendarDays className='h-4 w-4' />
                                                        <p>
                                                            {enroll.date ??
                                                                'Dec 16, 1971'}
                                                        </p>
                                                        <span>|</span>
                                                        <p>
                                                            {enroll.time ??
                                                                '12:12AM'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className='grid grid-cols-3 gap-2 mt-2'>
                                                    <div>
                                                        <div className='text-xs text-muted-foreground'>
                                                            Total Fee
                                                        </div>
                                                        <div className='text-xs font-medium'>
                                                            {formatCurrency(
                                                                enroll.totalFee,
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className='text-xs text-muted-foreground'>
                                                            Paid
                                                        </div>
                                                        <div className='text-xs font-medium text-green-600'>
                                                            {formatCurrency(
                                                                enroll.paid,
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className='text-xs text-muted-foreground'>
                                                            Due
                                                        </div>
                                                        <div className='text-xs font-medium text-amber-600'>
                                                            {formatCurrency(
                                                                enroll.due,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='flex items-center gap-2 mt-2'>
                                                    <div className='flex'>
                                                        {renderStars(
                                                            enroll.rating,
                                                        )}
                                                    </div>
                                                    <div className='text-xs text-muted-foreground'>
                                                        (
                                                        {(
                                                            enroll.rating || 0
                                                        ).toFixed(1)}
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
                                                                (enroll.progress ||
                                                                    0) > 0
                                                                    ? '#0736d1'
                                                                    : '#eee'
                                                            }
                                                            strokeWidth='3'
                                                            strokeDasharray={`${enroll.progress || 0}, 100`}
                                                        />
                                                    </svg>
                                                    <div className='absolute inset-0 flex items-center justify-center text-xs font-medium'>
                                                        {enroll.progress || 0}%
                                                    </div>
                                                </div>

                                                {selectedProgramId ===
                                                enroll._id ? (
                                                    <div className='px-4 py-1.5 rounded bg-[#e6ebfa] text-[#0736d1] text-xs font-medium flex items-center'>
                                                        <Check className='w-3 h-3 mr-1' />{' '}
                                                        Selected
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant='outline'
                                                        className={cn(
                                                            'px-4 py-1 h-auto text-xs',
                                                            enroll.status ===
                                                                'approved' ||
                                                                enroll.status ===
                                                                    'trial'
                                                                ? 'bg-[#0736d1] text-white hover:bg-[#0736d1]/90'
                                                                : 'bg-gray-100 text-gray-500',
                                                        )}
                                                        onClick={() =>
                                                            handleSelectProgram(
                                                                enroll._id,
                                                            )
                                                        }
                                                        disabled={
                                                            enroll.status !==
                                                                'approved' &&
                                                            enroll.status !==
                                                                'trial'
                                                        }
                                                    >
                                                        Switch to Program{' '}
                                                        <ArrowRight className='ml-1 h-3 w-3' />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </TabsContent>
                        <TabsContent value='courses' className='mt-4'>
                            <div className='flex items-center justify-center h-40 border rounded-md bg-background '>
                                <p className='text-muted-foreground'>
                                    Courses content will appear here
                                </p>
                            </div>
                        </TabsContent>
                        <TabsContent value='interviews' className='mt-4'>
                            <div className='flex items-center justify-center h-40 border rounded-md bg-background'>
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

                    <div>
                        <Button
                            className='w-full bg-[#0736d1] hover:bg-[#0736d1]/90'
                            onClick={handleSwitch}
                            disabled={!selectedProgramId}
                        >
                            Go to Program{' '}
                            <ArrowRight className='ml-2 h-4 w-4' />
                        </Button>
                    </div>
                </div>
            </GlobalModal>

            <UniversitySelectModal
                open={isUniversityModalOpen}
                onOpenChange={setIsUniversityModalOpen}
                onSelect={handleSelectUniversity}
            />
        </>
    );
}

export default SwitchModal;
