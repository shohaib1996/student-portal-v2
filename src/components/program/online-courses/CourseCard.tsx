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
import { Progress } from '@/components/ui/progress'; // (unused currently)
import { RadialProgress } from '@/components/global/RadialProgress';

import {
    ArrowRight,
    CalendarDays,
    Clock, // (unused currently)
    CreditCard, // (unused currently)
    FileText, // (unused currently)
    Network,
    Star, // (unused currently)
    University,
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

export default function CourseCard({ course }: { course: any }) {
    // Local State
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [reviewOpen, setReviewOpen] = useState<boolean>(false);

    // Redux Hooks
    const dispatch = useAppDispatch();
    const { isOpen, selectedUniversityId, selectedCourseId } = useAppSelector(
        (state: RootState) => state.selectionModal,
    );

    // Debug Log
    console.log({ course });

    // Event Handlers
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleConfirm = async () => {
        // For switching program, we use the current course as the selected enrollment
        const selected = course;
        if (selected) {
            // Dispatch enrollment change to Redux store and persist locally
            dispatch(setEnrollment(selected));
            await storage.setItem('active_enrolment', course);
            Cookies.set('activeEnrolment', course?._id);

            // Set active company (organization) for the enrollment
            dispatch(setActiveCompany(course?.organization?._id));
            Cookies.set('activeCompany', course?.organization?._id);

            // Notify and redirect
            toast.success(`Switched to ${course.program.title}`);
            dispatch(closeModal());
            window.location.href = '/program';
        }
    };

    return (
        <div>
            <Card className='w-full overflow-hidden border border-border-primary-light bg-foreground'>
                {/* Banner Section */}
                <div className='relative'>
                    <div className='relative h-[200px] w-full bg-blue-900/20'>
                        <Image
                            src={course?.program?.image || '/switchprogram.jpg'}
                            alt={course?.program?.title}
                            fill
                            className='object-cover brightness-[0.8] contrast-[1.1] saturate-[1.2] filter'
                        />
                        <div className='absolute inset-0 bg-blue-900/40'></div>
                    </div>
                    {/* Active Badge */}
                    <Badge className='absolute right-3 top-3 text-green-500 bg-background py-1'>
                        {course?.status}
                    </Badge>
                </div>

                {/* User Info / Instructor */}
                <div className='flex items-center justify-between p-2'>
                    <div className='flex items-center gap-1'>
                        <div className='h-6 w-6 relative rounded-full overflow-hidden bg-background'>
                            <Image
                                src='/avatar.png'
                                alt='John Doe'
                                width={32}
                                height={32}
                                className='h-full w-full object-cover'
                            />
                            <span className='h-2 w-2 bg-green-500 rounded-full absolute right-0 top-1/2'></span>
                        </div>
                        <div>
                            <h3 className='font-medium text-sm text-black'>
                                {course?.program?.instructor?.name}
                            </h3>
                        </div>
                    </div>
                    <Button
                        variant='outline'
                        size='sm'
                        className='text-primary px-1 py-0.5'
                        onClick={() => setReviewOpen(true)}
                    >
                        <ReviewIcon /> Give a Review
                    </Button>
                </div>

                {/* Course Header */}
                <CardHeader className='pt-0 px-2 pb-0 flex flex-row items-center justify-between gap-1 mb-2'>
                    <div>
                        <p className='flex items-center gap-1'>
                            <University size={16} /> Org With Logo
                        </p>
                        <p className='flex items-center gap-1 line-clamp-1'>
                            <Network size={16} /> {course.program?.title}
                        </p>
                        <p className='flex items-center gap-1'>
                            <CalendarDays size={16} />{' '}
                            {formatDateToCustomString(course.createdAt, false)}
                        </p>
                    </div>
                    <div>
                        <RadialProgress value={0} />
                    </div>
                </CardHeader>

                {/* Pricing / Fee Details */}
                <CardContent className='px-2 pt-0'>
                    <div className='grid grid-cols-3 rounded-md bg-background border border-muted p-2'>
                        <div>
                            <p className='text-sm text-gray'>Total Fee:</p>
                            <p className='font-medium'>
                                ${course?.totalAmount}
                            </p>
                        </div>
                        <div className='border-l pl-2'>
                            <p className='text-sm text-gray'>Paid:</p>
                            <p className='font-medium'>${course?.paid || 0}</p>
                        </div>
                        <div className='border-l pl-2'>
                            <p className='text-sm text-gray'>Due:</p>
                            <p className='font-medium'>
                                ${course?.totalAmount - course?.paid || 0}
                            </p>
                        </div>
                    </div>
                </CardContent>

                {/* Footer / Switch Program Button */}
                <CardFooter className='border-t border-border p-2 pt-2'>
                    <Button
                        className='col-span-1 text-xs w-full'
                        onClick={() => handleConfirm()}
                    >
                        <span>Switch to Program</span>
                        <ArrowRight className='h-3 w-3' />
                    </Button>
                </CardFooter>
            </Card>

            {/* Review Modal */}
            <GlobalModal
                open={reviewOpen}
                setOpen={setReviewOpen}
                className='w-[550px] md:w-[550px] lg:w-[550px]'
                allowFullScreen={false}
                subTitle='A quick overview of your feedback and rating'
                title='My Review'
            >
                <ReviewModal _id={course?._id as string} />
            </GlobalModal>

            {/* Payment Modal could be added here if needed */}
            {/* <PaymentModal open={isModalOpen} onOpenChange={handleCloseModal} /> */}
        </div>
    );
}
