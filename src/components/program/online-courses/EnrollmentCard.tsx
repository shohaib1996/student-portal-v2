import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import GlobalModal from '@/components/global/GlobalModal';
import ReviewModal from '@/components/shared/review-modal';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadialProgress } from '@/components/global/RadialProgress';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import {
    ArrowRight,
    CalendarDays,
    Clock,
    CreditCard,
    FileText,
    Network,
    Star,
    University,
    CircleDollarSign,
    BuildingIcon,
    GraduationCap,
    CalendarIcon,
    CheckCircle,
} from 'lucide-react';

import { formatDateToCustomString } from '@/lib/formatDateToCustomString';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { setEnrollment } from '@/redux/features/auth/authReducer';
import { setActiveCompany } from '@/redux/features/comapnyReducer';
import {
    closeModal,
    setSelectedUniversity,
    setSelectedCourse,
} from '@/redux/features/selectionModalSlice';

import storage from '@/utils/storage';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

import ReviewIcon from '@/components/svgs/common/ReviewIcon';

export default function EnrollmentCard({ enrollment }: { enrollment: any }) {
    // Local State
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [reviewOpen, setReviewOpen] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    // Redux Hooks
    const dispatch = useAppDispatch();
    const { isOpen, selectedUniversityId, selectedCourseId } = useAppSelector(
        (state: RootState) => state.selectionModal,
    );

    // Calculate completion percentage (placeholder - replace with actual logic)
    const completionPercentage = 65;

    // Event Handlers
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleConfirm = async () => {
        // For switching program, we use the current course as the selected enrollment
        const selected = enrollment;
        if (selected) {
            try {
                // Dispatch enrollment change to Redux store and persist locally
                dispatch(setEnrollment(selected));
                await storage.setItem('active_enrolment', enrollment);
                Cookies.set('activeEnrolment', enrollment?._id);

                // Set active company (organization) for the enrollment
                dispatch(setActiveCompany(enrollment?.organization?._id));
                Cookies.set('activeCompany', enrollment?.organization?._id);

                // Notify and redirect
                toast.success(`Switched to ${enrollment.program.title}`);
                dispatch(closeModal());
                window.location.href = '/program';
            } catch (error) {
                toast.error('Failed to switch program. Please try again.');
                console.error('Error switching program:', error);
            }
        }
    };

    // Calculate payment stats
    const totalAmount = enrollment?.totalAmount || 0;
    const totalPaid = enrollment?.totalPaid || 0;
    const totalDue = totalAmount - totalPaid;
    const paymentPercentage =
        totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

    return (
        <Card
            className='w-full overflow-hidden border border-border-primary-light bg-foreground shadow-sm hover:shadow-md transition-all duration-300'
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Banner Section with Gradient Overlay */}
            <div className='relative'>
                <div className='relative h-[180px] w-full overflow-hidden'>
                    <Image
                        src={enrollment?.program?.image || '/switchprogram.jpg'}
                        alt={enrollment?.program?.title || 'Program Image'}
                        fill
                        className={`object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
                        priority
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-blue-900/80 to-blue-900/20'></div>
                </div>

                {/* Status Badge */}
                <Badge
                    className={`
                        absolute left-3 top-3 py-1 px-3 font-medium capitalize
                  
                    `}
                >
                    {enrollment?.program?.type}
                </Badge>
                <Badge
                    className={`
                        absolute right-3 top-3 py-1 px-3 font-medium capitalize
                        ${
                            enrollment?.status === 'active'
                                ? 'bg-green-100 text-green-700 border-green-300'
                                : enrollment?.status === 'pending'
                                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                                  : 'bg-blue-100 text-blue-700 border-blue-300'
                        }
                    `}
                >
                    <CheckCircle className='h-3.5 w-3.5 mr-1' />
                    {enrollment?.status || 'Enrolled'}
                </Badge>

                {/* Program Title Overlay */}
                <div className='absolute bottom-0 left-0 right-0 p-3 text-white'>
                    <h3 className='font-bold text-lg line-clamp-1'>
                        {enrollment.program?.title}
                    </h3>
                    <div className='flex items-center gap-2 text-sm'>
                        <University size={14} className='opacity-80' />
                        <span className='line-clamp-1 opacity-90'>
                            {enrollment?.organization?.name}
                        </span>
                    </div>
                </div>
            </div>

            {/* Instructor Info */}
            <div className='flex items-center justify-between p-3 border-b border-border-primary-light/30'>
                <div className='flex items-center gap-2'>
                    <div className='h-10 w-10 relative rounded-full bg-background border-2 border-white'>
                        <Image
                            src={
                                enrollment?.program?.instructor?.image ||
                                '/avatar.png'
                            }
                            alt={
                                enrollment?.program?.instructor?.name ||
                                'Instructor'
                            }
                            width={40}
                            height={40}
                            className='h-full w-full object-cover rounded-full'
                        />
                        <span className='h-3 w-3 bg-green-500 rounded-full absolute right-0 bottom-0 border-2 border-white'></span>
                    </div>
                    <div>
                        <p className='text-xs text-gray-500'>Instructor</p>
                        <h3 className='font-semibold text-sm'>
                            {enrollment?.program?.instructor?.name ||
                                'Lead Instructor'}
                        </h3>
                    </div>
                </div>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant='outline'
                                size='sm'
                                className='text-primary border-primary/30 hover:bg-primary/5'
                                onClick={() => setReviewOpen(true)}
                            >
                                <ReviewIcon /> Review
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Share your feedback about this program</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Course Details */}
            <CardContent className='p-3 space-y-3'>
                {/* Program Details */}
                <div className='space-y-1.5'>
                    {/* Branch & Session */}
                    <div className='grid grid-cols-2 gap-2'>
                        <div className='bg-gray-50 p-2 rounded-md dark:bg-background'>
                            <p className='text-xs text-gray-500 flex items-center gap-1'>
                                <BuildingIcon size={12} /> Branch
                            </p>
                            <p className='text-sm font-medium line-clamp-1'>
                                {enrollment.branch?.name || 'Main Campus'}
                            </p>
                        </div>
                        <div className='bg-gray-50 p-2 rounded-md dark:bg-background'>
                            <p className='text-xs text-gray-500 flex items-center gap-1'>
                                <CalendarIcon size={12} /> Session
                            </p>
                            <p className='text-sm font-medium line-clamp-1'>
                                {enrollment.session?.name || 'Current'}
                            </p>
                        </div>
                    </div>

                    {/* Enrollment Date & Progress */}
                    {/* <div className='flex items-center justify-between mt-2 text-sm'>
                        <div className='flex items-center gap-1 text-gray-600'>
                            <CalendarDays size={14} /> 
                            <span>Enrolled: {formatDateToCustomString(enrollment.createdAt, false)}</span>
                        </div>
                        
                       
                        <div className='flex items-center gap-1'>
                            <RadialProgress value={completionPercentage} size={36} strokeWidth={3} />
                            <div className='text-xs'>
                                <p className='text-gray-500'>Progress</p>
                                <p className='font-medium'>{completionPercentage}%</p>
                            </div>
                        </div>
                    </div> */}
                </div>

                {/* Payment Section */}
                <div className='mt-3'>
                    <div className='flex justify-between items-center mb-1.5'>
                        <h4 className='text-sm font-semibold flex items-center gap-1'>
                            <CircleDollarSign size={14} /> Payment Status
                        </h4>
                        <span className='text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full'>
                            {paymentPercentage >= 100
                                ? 'Paid'
                                : paymentPercentage > 0
                                  ? 'Partially Paid'
                                  : 'Unpaid'}
                        </span>
                    </div>

                    {/* Payment Progress Bar */}
                    <Progress value={paymentPercentage} className='h-2 mb-2' />

                    {/* Payment Details */}
                    <div className='grid grid-cols-3 gap-2 text-center'>
                        <div className='bg-gray-50 dark:bg-background rounded-md p-2'>
                            <p className='text-xs text-gray-500'>Total Fee</p>
                            <p className='font-semibold'>${totalAmount}</p>
                        </div>
                        <div className='bg-green-50 dark:bg-background rounded-md p-2'>
                            <p className='text-xs text-gray-500'>Paid</p>
                            <p className='font-semibold text-green-600'>
                                ${totalPaid}
                            </p>
                        </div>
                        <div
                            className={`rounded-md p-2 ${totalDue > 0 ? 'bg-amber-50' : 'bg-green-50'} dark:bg-background`}
                        >
                            <p className='text-xs text-gray-500'>Due</p>
                            <p
                                className={`font-semibold ${totalDue > 0 ? 'text-amber-600' : 'text-green-600'}`}
                            >
                                ${totalDue}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>

            {/* Footer / Switch Program Button */}
            <CardFooter className='border-t border-border-primary-light/30 p-3'>
                <Button
                    className='w-full gap-1 font-medium hover:gap-2 transition-all'
                    onClick={handleConfirm}
                >
                    <span>
                        Switch to this{' '}
                        {enrollment?.program?.type || 'enrollment'}
                    </span>
                    <ArrowRight className='h-4 w-4' />
                </Button>
            </CardFooter>

            {/* Review Modal */}
            <GlobalModal
                open={reviewOpen}
                setOpen={setReviewOpen}
                className='w-[550px] md:w-[550px] lg:w-[550px]'
                allowFullScreen={false}
                subTitle='Share your experience with this program'
                title='Program Review'
            >
                <ReviewModal _id={enrollment?.program?._id as string} />
            </GlobalModal>
        </Card>
    );
}
