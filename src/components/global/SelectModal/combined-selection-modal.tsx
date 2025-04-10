'use client';

import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    ArrowRight,
    Check,
    Star,
    CalendarDays,
    University,
    Search,
    AlertCircle,
    GraduationCap,
    BookOpen,
    MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import GlobalModal from '@/components/global/GlobalModal';
import Cookies from 'js-cookie';
import { RootState } from '@/redux/store';
import { setActiveCompany } from '@/redux/features/comapnyReducer';
import { setEnrollment } from '@/redux/features/auth/authReducer';
import {
    closeModal,
    setSelectedUniversity,
    setSelectedCourse,
} from '@/redux/features/selectionModalSlice';
import storage from '@/utils/storage';
import { toast } from 'sonner';
import { TEnrollment } from '@/types/auth';

export function CombinedSelectionModal({ myEnrollments }: any) {
    const dispatch = useDispatch();
    // const { myEnrollments } = useSelector((state: RootState) => state.auth);
    const { companies, activeCompany } = useSelector(
        (state: RootState) => state.company,
    );
    const { isOpen, selectedUniversityId, selectedCourseId } = useSelector(
        (state: RootState) => state.selectionModal,
    );

    const activeEnrollmentFromCookie = Cookies.get('activeEnrolment');

    const [searchQuery, setSearchQuery] = useState('');
    const [setAsDefault, setSetAsDefault] = useState(false);
    const [activeTab, setActiveTab] = useState('program');

    // Memoize filtered enrollments to prevent recalculations on every render
    const { filteredPrograms, filteredCourses, filteredInterviews } =
        useMemo(() => {
            const lowercasedQuery = searchQuery.toLowerCase();
            return {
                filteredPrograms: myEnrollments.filter(
                    (enroll: any) =>
                        enroll.program.type === 'program' &&
                        enroll.program.title
                            .toLowerCase()
                            .includes(lowercasedQuery),
                ),
                filteredCourses: myEnrollments.filter(
                    (enroll: any) =>
                        enroll.program.type === 'course' &&
                        enroll.program.title
                            .toLowerCase()
                            .includes(lowercasedQuery),
                ),
                filteredInterviews: myEnrollments.filter(
                    (enroll: any) =>
                        enroll.program.type === 'interview' &&
                        enroll.program.title
                            .toLowerCase()
                            .includes(lowercasedQuery),
                ),
            };
        }, [myEnrollments, searchQuery]);

    const handleUniversitySelect = (id: string) =>
        dispatch(setSelectedUniversity(id));
    const handleCourseSelect = (id: string) => dispatch(setSelectedCourse(id));

    const handleConfirm = async () => {
        const selected = myEnrollments.find(
            (e: any) => e._id === selectedCourseId,
        );
        if (selected) {
            dispatch(setEnrollment(selected));
            await storage.setItem('active_enrolment', selected);
            Cookies.set('activeEnrolment', selected?._id);

            dispatch(setActiveCompany(selected?.organization?._id));
            Cookies.set('activeCompany', selected?.organization?._id);

            toast.success(`Switched to ${selected.program.title}`);
            dispatch(closeModal());
            window.location.href = '/dashboard/program';
        }
    };

    const formatCurrency = (amount = 0) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        })
            .format(amount)
            .replace('.00', '');
    };

    // Memoize the star rendering to prevent unnecessary recalculations
    const renderStars = (rating = 0) =>
        Array(5)
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

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        // Set university from cookies
        const activeCompanyFromCookies = Cookies.get('activeCompany');
        if (activeCompanyFromCookies) {
            const matchingCompany = companies.find(
                (company) => company._id === activeCompanyFromCookies,
            );
            handleUniversitySelect(
                matchingCompany ? activeCompanyFromCookies : '',
            );
        } else {
            handleUniversitySelect('');
        }

        // Set enrollment from storage
        const activeEnrollment = storage.getItem('active_enrolment');
        if (activeEnrollment && activeEnrollment._id) {
            const matchingEnrollment = myEnrollments.find(
                (enroll: any) => enroll._id === activeEnrollment._id,
            );
            if (matchingEnrollment) {
                handleCourseSelect(matchingEnrollment._id);
            }
        }
    }, [isOpen, companies, myEnrollments]);

    // Extracted common enrollment card to reduce repetition
    // Update the EnrollmentCard component with an improved selection indicator
    const EnrollmentCard = ({ enroll }: any) => (
        <div
            key={enroll._id}
            className={cn(
                'border rounded-lg p-3 bg-background transition-all duration-200 relative',
                activeEnrollmentFromCookie === enroll._id
                    ? 'border-primary ring-2 ring-primary/30 shadow-md'
                    : 'hover:border-gray-300 hover:shadow-sm',
            )}
            onClick={() => handleCourseSelect(enroll._id)}
        >
            {/* Selection indicator - visible only when selected */}
            {activeEnrollmentFromCookie === enroll._id && (
                <div className='absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-16 bg-primary rounded-r-md'></div>
            )}

            <div className='grid grid-cols-6 gap-2'>
                {/* left section */}
                <div className='relative w-full h-full'>
                    <Image
                        src={enroll?.program?.image || '/default_image.png'}
                        alt={enroll?.program?.title}
                        width={200}
                        height={200}
                        className='rounded-md object-cover w-[80px] h-[80px]'
                    />

                    <div className='absolute inset-0 flex items-end pb-3 justify-center'>
                        <div className='flex items-center gap-2'>
                            <div className='flex'>
                                {renderStars(enroll.rating)}
                            </div>
                            <div className='text-xs text-muted-foreground'>
                                ({(enroll.rating || 0).toFixed(1)})
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right section */}
                <div className='col-span-5'>
                    {/* top part */}
                    <div className='flex items-center justify-between pb-2 border-b mb-2'>
                        <div>
                            <div className='flex items-center gap-2 flex-wrap'>
                                <h3 className='text-sm font-medium'>
                                    {enroll.program.title}
                                </h3>
                                {enroll.status === 'approved' && (
                                    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                                        <Check className='w-3 h-3 mr-1' />{' '}
                                        Approved
                                    </span>
                                )}
                                {enroll.status === 'pending' && (
                                    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800'>
                                        <AlertCircle className='w-3 h-3 mr-1' />
                                        Pending
                                    </span>
                                )}
                                {enroll.status === 'trial' && (
                                    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                                        <Check className='w-3 h-3 mr-1' /> Trial
                                    </span>
                                )}
                            </div>

                            <div className='flex items-center mt-1 gap-1'>
                                <div className='text-xs text-muted-foreground flex items-center gap-1'>
                                    <University size={18} />{' '}
                                    {enroll.organization.name}
                                </div>
                            </div>

                            <div className='flex items-center mt-1 gap-2'>
                                <div className='text-xs text-muted-foreground flex items-center gap-1'>
                                    <CalendarDays className='h-4 w-4' />
                                    <p>{enroll.date ?? 'Dec 16, 1971'}</p>
                                    <span>|</span>
                                    <p>{enroll.time ?? '12:12AM'}</p>
                                </div>

                                <div className='flex items-center gap-1'>
                                    <Image
                                        src={
                                            enroll.program.instructor.image ||
                                            '/avatar.png'
                                        }
                                        alt={enroll.program.instructor.name}
                                        width={100}
                                        height={10}
                                        className='rounded-full h-4 w-4'
                                    />
                                    <span className='text-xs text-muted-foreground'>
                                        {enroll.program.instructor.name}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className='relative h-14 w-14 flex items-center justify-center'>
                            {/* Circle background */}
                            <div
                                className={cn(
                                    'absolute h-12 w-12 rounded-full',
                                    selectedCourseId === enroll._id
                                        ? 'bg-primary/10'
                                        : 'bg-gray-100',
                                )}
                            ></div>

                            {/* Progress circle */}
                            {/* <svg viewBox="0 0 36 36" className="absolute h-12 w-12 -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={(enroll.progress || 0) > 0 ? (selectedCourseId === enroll._id ? '#0037ff' : '#0736d1') : '#eee'}
                  strokeWidth="3"
                  strokeDasharray={`${enroll.progress || 0}, 100`}
                />
              </svg> */}

                            {/* Percentage text */}
                            {/* <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn(
                  "text-xs font-semibold",
                  selectedCourseId === enroll._id ? "text-primary" : ""
                )}>{enroll.progress || 0}%</span>
              </div> */}
                        </div>
                    </div>

                    {/* bottom part */}
                    <div className='flex items-center justify-between w-full'>
                        <div className='flex gap-6'>
                            <div>
                                <div className='text-xs text-muted-foreground'>
                                    Total Fee
                                </div>
                                <div className='text-xs font-medium'>
                                    {formatCurrency(enroll.totalFee)}
                                </div>
                            </div>
                            <div>
                                <div className='text-xs text-muted-foreground'>
                                    Paid
                                </div>
                                <div className='text-xs font-medium text-green-600'>
                                    {formatCurrency(enroll.paid)}
                                </div>
                            </div>
                            <div>
                                <div className='text-xs text-muted-foreground'>
                                    Due
                                </div>
                                <div className='text-xs font-medium text-amber-600'>
                                    {formatCurrency(enroll.due)}
                                </div>
                            </div>
                        </div>

                        {/* right button */}
                        <div className='flex flex-col items-end justify-between'>
                            {selectedCourseId === enroll._id ? (
                                <div className='px-4 py-1.5 rounded bg-primary/10 text-primary text-xs font-medium flex items-center'>
                                    <Check className='w-3 h-3 mr-1' /> Selected
                                </div>
                            ) : (
                                <Button
                                    size='sm'
                                    variant={
                                        enroll.status === 'approved' ||
                                        enroll.status === 'trial'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    className='text-xs'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCourseSelect(enroll._id);
                                    }}
                                    disabled={
                                        enroll.status !== 'approved' &&
                                        enroll.status !== 'trial'
                                    }
                                >
                                    Switch to Program{' '}
                                    <ArrowRight className='ml-1 h-3 w-3' />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Extracted empty state to avoid repetition
    const EmptyState = () => (
        <div className='text-center py-8 space-y-2'>
            <AlertCircle className='mx-auto h-12 w-12 text-muted-foreground opacity-50' />
            <h2 className='text-xl font-semibold'>No enrollment found</h2>
            <p className='text-muted-foreground text-sm'>
                There are no enrollments matching your criteria.
            </p>
        </div>
    );

    // Render enrollments based on tab and data
    const renderTabContent = (enrollments: TEnrollment[]) => (
        <div className='space-y-4 h-[54vh] overflow-y-auto pr-2 mt-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'>
            {enrollments.length === 0 ? (
                <EmptyState />
            ) : (
                enrollments.map((enroll) => (
                    <EnrollmentCard key={enroll._id} enroll={enroll} />
                ))
            )}
        </div>
    );

    return (
        <GlobalModal
            open={isOpen}
            setOpen={() => dispatch(closeModal())}
            title='Switch Bootcamp'
            subTitle='Select the program you want to switch to from your enrolled programs below.'
            className='w-full max-w-4xl bg-foreground h-[90vh]'
            allowFullScreen={true}
        >
            <div className='py-3'>
                <div className='space-y-3 bg-background p-3 rounded-lg'>
                    <div className='relative'>
                        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                            <Search className='w-4 h-4 text-gray-500' />
                        </div>
                        <Input
                            className='pl-10 bg-foreground'
                            placeholder='Search programs...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Tabs
                    defaultValue='program'
                    value={activeTab}
                    onValueChange={setActiveTab}
                >
                    <TabsList className='flex items-center justify-start gap-3 bg-transparent mt-4'>
                        <TabsTrigger
                            value='program'
                            className='text-xs data-[state=active]:text-primary-white shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-white border-b rounded-none data-[state=active]:border-b-primary-white'
                        >
                            <GraduationCap className='w-4 h-4 mr-1' />
                            Programs ({filteredPrograms.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value='courses'
                            className='text-xs data-[state=active]:text-primary-white shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-white border-b rounded-none data-[state=active]:border-b-primary-white'
                        >
                            <BookOpen className='w-4 h-4 mr-1' />
                            Courses ({filteredCourses.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value='interviews'
                            className='text-xs data-[state=active]:text-primary-white shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-white border-b rounded-none data-[state=active]:border-b-primary-white'
                        >
                            <MessageSquare className='w-4 h-4 mr-1' />
                            Interviews ({filteredInterviews.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value='program'>
                        {renderTabContent(filteredPrograms)}
                    </TabsContent>
                    <TabsContent value='courses'>
                        {renderTabContent(filteredCourses)}
                    </TabsContent>
                    <TabsContent value='interviews'>
                        {renderTabContent(filteredInterviews)}
                    </TabsContent>
                </Tabs>

                <div className='flex items-center justify-end mt-6 space-x-3'>
                    <Button
                        variant='outline'
                        onClick={() => dispatch(closeModal())}
                        className='px-4'
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedCourseId}
                        className='px-5 font-medium'
                    >
                        Go to Program <ArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                </div>
            </div>
        </GlobalModal>
    );
}

export default CombinedSelectionModal;
