'use client';

import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    ArrowRight,
    Check,
    CalendarDays,
    University,
    Search,
    AlertCircle,
    GraduationCap,
    BookOpen,
    MessageSquare,
    Clock,
    Building,
    Users,
    Tag,
    Briefcase,
    BookMarked,
    CalendarClock,
    Award,
    MapPin,
    School,
    CreditCard,
    DollarSign,
    Receipt,
    Wallet,
    BanknoteIcon,
    CircleDollarSign,
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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export function CombinedSelectionModal({ myEnrollments }: any) {
    const dispatch = useDispatch();
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
    const [expandedEnrollments, setExpandedEnrollments] = useState<string[]>(
        [],
    );

    const activeEnrolment = Cookies.get('activeEnrolment');

    // Memoize filtered enrollments to prevent recalculations on every render
    const { filteredPrograms, filteredCourses, filteredInterviews } =
        useMemo(() => {
            const lowercasedQuery = searchQuery.toLowerCase();

            const filterFn = (enroll: any) => {
                const titleMatch = enroll.program.title
                    .toLowerCase()
                    .includes(lowercasedQuery);
                const orgMatch = enroll.organization?.name
                    ?.toLowerCase()
                    .includes(lowercasedQuery);
                const branchMatch = enroll.branch?.name
                    ?.toLowerCase()
                    .includes(lowercasedQuery);
                const sessionMatch = enroll.session?.name
                    ?.toLowerCase()
                    .includes(lowercasedQuery);
                const instructorMatch = enroll.program.instructor?.name
                    ?.toLowerCase()
                    .includes(lowercasedQuery);

                return (
                    titleMatch ||
                    orgMatch ||
                    branchMatch ||
                    sessionMatch ||
                    instructorMatch
                );
            };

            return {
                filteredPrograms: myEnrollments.filter(
                    (enroll: any) =>
                        enroll.program.type === 'program' && filterFn(enroll),
                ),
                filteredCourses: myEnrollments.filter(
                    (enroll: any) =>
                        enroll.program.type === 'course' && filterFn(enroll),
                ),
                filteredInterviews: myEnrollments.filter(
                    (enroll: any) =>
                        enroll.program.type === 'interview' && filterFn(enroll),
                ),
            };
        }, [myEnrollments, searchQuery]);

    const handleUniversitySelect = (id: string) =>
        dispatch(setSelectedUniversity(id));

    const handleCourseSelect = (id: string) => {
        if (activeEnrolment === id) {
            toast.warning('This program is already selected');
        } else {
            dispatch(setSelectedCourse(id));
        }
    };

    const handleConfirm = async () => {
        const selected = myEnrollments.find(
            (e: any) => e._id === selectedCourseId,
        );
        if (selected) {
            try {
                dispatch(setEnrollment(selected));
                await storage.setItem('active_enrolment', selected);
                Cookies.set('activeEnrolment', selected?._id);

                dispatch(setActiveCompany(selected?.organization?._id));
                Cookies.set('activeCompany', selected?.organization?._id);

                toast.success(`Switched to ${selected.program.title}`);
                dispatch(closeModal());
                window.location.href = '/program';
            } catch (error) {
                toast.error('Failed to switch program. Please try again.');
                console.error('Error switching program:', error);
            }
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

    // Calculate payment progress
    const calculatePaymentProgress = (total: number, paid: number) => {
        if (total <= 0) {
            return 0;
        }
        const progress = (paid / total) * 100;
        return Math.min(progress, 100); // Ensure we don't exceed 100%
    };

    // Toggle enrollment expanded state
    const toggleExpanded = (id: string) => {
        setExpandedEnrollments((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    // Format date string if needed
    const formatDate = (dateString: string) => {
        if (!dateString) {
            return 'N/A';
        }
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            return dateString;
        }
    };

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

    // Get the status badge with appropriate color
    const StatusBadge = ({ status }: { status: string }) => {
        let Icon, bgColor, textColor, label;

        switch (status) {
            case 'approved':
                Icon = Check;
                bgColor = 'bg-green-100';
                textColor = 'text-green-800';
                label = 'Approved';
                break;
            case 'pending':
                Icon = Clock;
                bgColor = 'bg-orange-100';
                textColor = 'text-orange-800';
                label = 'Pending';
                break;
            case 'trial':
                Icon = Award;
                bgColor = 'bg-blue-100';
                textColor = 'text-blue-800';
                label = 'Trial';
                break;
            default:
                Icon = Tag;
                bgColor = 'bg-gray-100';
                textColor = 'text-gray-800';
                label = status || 'Unknown';
        }

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
            >
                <Icon className='w-3 h-3 mr-1' /> {label}
            </span>
        );
    };

    // Enhanced enrollment card
    const EnrollmentCard = ({ enroll }: any) => {
        const isExpanded = expandedEnrollments.includes(enroll._id);
        const isSelected = selectedCourseId === enroll._id;
        const isActive = activeEnrollmentFromCookie === enroll._id;
        const paymentProgress = calculatePaymentProgress(
            enroll.totalAmount || 0,
            enroll.totalPaid || 0,
        );
        // Calculate payment stats
        const totalAmount = enroll?.totalAmount || 0;
        const totalPaid = enroll?.totalPaid || 0;
        const totalDue = totalAmount - totalPaid;
        const paymentPercentage =
            totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;
        return (
            <div
                key={enroll._id}
                className={cn(
                    'border rounded-lg bg-foreground transition-all duration-200 relative overflow-hidden',
                    isActive
                        ? 'border-primary shadow-md'
                        : isSelected
                          ? 'border-blue-300 shadow-sm ring-2 ring-blue-100'
                          : 'hover:border-gray-300 hover:shadow-sm border-gray-200',
                )}
            >
                {/* Selection indicator */}
                {isActive && (
                    <div className='absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-20 bg-primary rounded-r-md'></div>
                )}

                {/* Card header - always visible */}
                <div
                    className='p-3 cursor-pointer'
                    onClick={() => {
                        handleCourseSelect(enroll._id);
                        // Only toggle expanded if it's not already selected
                        if (!isSelected) {
                            toggleExpanded(enroll._id);
                        }
                    }}
                >
                    <div className='grid grid-cols-12 gap-3'>
                        {/* Image Column */}
                        <div className='col-span-3 md:col-span-2'>
                            <div className='relative aspect-square rounded-md overflow-hidden border border-gray-200'>
                                <Image
                                    src={
                                        enroll?.program?.image ||
                                        '/default_image.png'
                                    }
                                    alt={enroll?.program?.title}
                                    fill
                                    className='object-cover'
                                />
                                {isActive && (
                                    <div className='absolute top-1 right-1 bg-green-500 text-white p-1 rounded-full'>
                                        <Check className='w-3 h-3' />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Column */}
                        <div className='col-span-9 md:col-span-10'>
                            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
                                <div>
                                    <div className='flex flex-wrap items-center gap-2'>
                                        <h3 className='text-sm font-semibold line-clamp-1'>
                                            {enroll.program.title}
                                        </h3>
                                        <StatusBadge status={enroll.status} />
                                    </div>

                                    <div className='flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5'>
                                        <div className='text-xs text-muted-foreground flex items-center gap-1'>
                                            <University
                                                size={14}
                                                className='text-blue-600'
                                            />
                                            <span className='line-clamp-1'>
                                                {enroll.organization?.name ||
                                                    'Organization'}
                                            </span>
                                        </div>

                                        <div className='text-xs text-muted-foreground flex items-center gap-1'>
                                            <Building
                                                size={14}
                                                className='text-violet-600'
                                            />
                                            <span className='line-clamp-1'>
                                                {enroll.branch?.name ||
                                                    'Main Branch'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5'>
                                        <div className='text-xs text-muted-foreground flex items-center gap-1'>
                                            <CalendarClock
                                                size={14}
                                                className='text-amber-600'
                                            />
                                            <span className='line-clamp-1'>
                                                {enroll.session?.name ||
                                                    'Current Session'}
                                            </span>
                                        </div>

                                        <div className='text-xs text-muted-foreground flex items-center gap-1'>
                                            <Users
                                                size={14}
                                                className='text-emerald-600'
                                            />
                                            <span>
                                                {enroll.program.instructor
                                                    ?.name || 'Instructor'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className='flex items-center mt-1.5 gap-x-4'>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className='text-xs text-muted-foreground flex items-center gap-1'>
                                                        <CalendarDays
                                                            size={14}
                                                            className='text-neutral-600'
                                                        />
                                                        <span>
                                                            {formatDate(
                                                                enroll.createdAt,
                                                            ) ||
                                                                'Enrollment Date'}
                                                        </span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>
                                                        Date when you enrolled
                                                        in this program
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className='hidden md:flex items-center gap-1 text-xs text-muted-foreground'>
                                                        <CalendarDays
                                                            size={14}
                                                            className='text-blue-600'
                                                        />
                                                        <span>
                                                            Enrolled:{' '}
                                                            {enroll.date ||
                                                                'N/A'}
                                                        </span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>
                                                        Date when you enrolled
                                                        in this program
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>

                                {/* Switch Button (visible on larger screens) */}
                                <div className='hidden md:block'>
                                    {isSelected ? (
                                        <div className='px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium flex items-center'>
                                            <Check className='w-3.5 h-3.5 mr-1.5' />{' '}
                                            Selected
                                        </div>
                                    ) : (
                                        <Button
                                            size='sm'
                                            variant={
                                                isActive ? 'outline' : 'default'
                                            }
                                            className={cn(
                                                'text-xs',
                                                isActive &&
                                                    'border-green-300 text-green-700 bg-green-50 hover:bg-green-100',
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCourseSelect(enroll._id);
                                            }}
                                            disabled={
                                                enroll.status !== 'approved' &&
                                                enroll.status !== 'trial'
                                            }
                                        >
                                            {isActive ? (
                                                <>
                                                    Current Program{' '}
                                                    <Check className='ml-1 h-3 w-3' />
                                                </>
                                            ) : (
                                                <>
                                                    Switch{' '}
                                                    <ArrowRight className='ml-1 h-3 w-3' />
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Payment Section */}
                    <div className='mt-3'>
                        <div className='flex justify-between items-center mb-1.5 '>
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
                        <Progress
                            value={paymentPercentage}
                            className='h-2 mb-2'
                        />

                        {/* Payment Details */}
                        <div className='grid grid-cols-3 gap-2 text-center'>
                            <div className='bg-gray-50 dark:bg-background rounded-md p-2'>
                                <p className='text-xs text-gray-500'>
                                    Total Fee
                                </p>
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
                </div>
            </div>
        );
    };

    // Extracted empty state to avoid repetition
    const EmptyState = () => (
        <div className='text-center py-10 space-y-3 bg-gray-50 rounded-lg border border-dashed border-gray-300 dark:bg-foreground'>
            <AlertCircle className='mx-auto h-12 w-12 text-muted-foreground opacity-50' />
            <h2 className='text-xl font-semibold'>No enrollments found</h2>
            <p className='text-muted-foreground text-sm max-w-sm mx-auto'>
                There are no enrollments matching your search criteria. Try
                adjusting your filters or search term.
            </p>
        </div>
    );

    // Render enrollments based on tab and data
    const renderTabContent = (enrollments: TEnrollment[]) => (
        <div className='space-y-3 h-[54vh] overflow-y-auto pr-2 mt-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'>
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
            title='Switch Program'
            subTitle='Select the program you want to switch to from your enrolled programs below.'
            className='w-[98%] md:w-full max-w-5xl bg-background h-[90vh]'
            allowFullScreen={true}
        >
            <div className='py-4'>
                {/* Search and Filter */}
                <div className='bg-background p-1 rounded-lg shadow-sm border border-gray-100'>
                    <div className='relative'>
                        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                            <Search className='w-4 h-4 text-gray-500' />
                        </div>
                        <Input
                            className='pl-10 bg-foreground'
                            placeholder='Search by program, organization, branch, session or instructor...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <Tabs
                    defaultValue='program'
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className='mt-4'
                >
                    <TabsList className='flex items-center justify-start gap-2 bg-transparent overflow-x-auto overflow-y-hidden'>
                        <TabsTrigger
                            value='program'
                            className='text-sm data-[state=active]:text-white data-[state=active]:bg-primary data-[state=active]:border-primary rounded-md px-4'
                        >
                            <GraduationCap className='w-4 h-4 mr-1.5' />
                            Programs ({filteredPrograms.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value='courses'
                            className='text-sm data-[state=active]:text-white data-[state=active]:bg-primary data-[state=active]:border-primary rounded-md px-4'
                        >
                            <BookOpen className='w-4 h-4 mr-1.5' />
                            Courses ({filteredCourses.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value='interviews'
                            className='text-sm data-[state=active]:text-white data-[state=active]:bg-primary data-[state=active]:border-primary rounded-md px-4'
                        >
                            <MessageSquare className='w-4 h-4 mr-1.5' />
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

                {/* Footer Action Buttons */}
                <div className='flex flex-col md:flex-row gap-2 md:gap-0 items-center justify-between mt-6 pt-3 border-t border-gray-200 w-full'>
                    <div className='flex items-center'>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className='flex items-center gap-1 text-xs text-gray-500'>
                                        <School className='w-4 h-4 text-blue-600' />
                                        <span>
                                            Your enrollments (
                                            {myEnrollments.length})
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        Total enrollments across all categories
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className='flex items-center gap-3'>
                        <Button
                            variant='outline'
                            onClick={() => dispatch(closeModal())}
                            className='px-4 '
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!selectedCourseId}
                            className='px-5 font-medium '
                        >
                            Go to Program{' '}
                            <ArrowRight className='ml-2 h-4 w-4' />
                        </Button>
                    </div>
                </div>
            </div>
        </GlobalModal>
    );
}

export default CombinedSelectionModal;
