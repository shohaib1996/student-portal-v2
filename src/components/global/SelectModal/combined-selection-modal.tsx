// // components/CombinedSelectionModal.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { X, ArrowRight, Check, Star, CalendarDays } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { cn } from '@/lib/utils';
// import Image from 'next/image';
// import GlobalModal from '@/components/global/GlobalModal';
// import Cookies from 'js-cookie';
// import { RootState } from '@/redux/store';
// import { setActiveCompany } from '@/redux/features/comapnyReducer';
// import { setEnrollment } from '@/redux/features/auth/authReducer';
// import {
//     closeModal,
//     switchView,
//     setSelectedUniversity,
//     setSelectedCourse,
// } from '@/redux/features/selectionModalSlice';
// import storage from '@/utils/storage';
// import { toast } from 'sonner';
// import { useRouter } from 'next/navigation';

// interface Company {
//     _id: string;
//     name: string;
//     description?: string;
//     image?: string;
//     status?: 'active' | 'pending' | 'inactive';
//     date?: string;
//     time?: string;
// }

// interface Enrollment {
//     _id: string;
//     status: string;
//     program: {
//         title: string;
//         instructor: { name: string; image: string };
//     };
//     session: { name: string };
//     organization: { name: string };
//     image?: string;
//     date?: string;
//     time?: string;
//     totalFee?: number;
//     paid?: number;
//     due?: number;
//     rating?: number;
//     progress?: number;
// }

// export function CombinedSelectionModal() {
//     const dispatch = useDispatch();
//     const router = useRouter();
//     const { myEnrollments } = useSelector((state: RootState) => state.auth);
//     const { companies, activeCompany } = useSelector(
//         (state: RootState) => state.company,
//     );
//     const { isOpen, activeView, selectedUniversityId, selectedCourseId } =
//         useSelector((state: RootState) => state.selectionModal);

//     const [searchQuery, setSearchQuery] = useState('');
//     const [setAsDefault, setSetAsDefault] = useState(false);
//     const [activeTab, setActiveTab] = useState('program');

//     const filteredCompanies = companies.filter((company) =>
//         company.name.toLowerCase().includes(searchQuery.toLowerCase()),
//     );
//     const filteredEnrollments = myEnrollments.filter((enroll) =>
//         enroll.program.title.toLowerCase().includes(searchQuery.toLowerCase()),
//     );

//     const selectedUniversity = companies.find(
//         (company) =>
//             company._id === (activeCompany || Cookies.get('activeCompany')),
//     );

//     const handleUniversitySelect = (id: string) => {
//         dispatch(setSelectedUniversity(id));
//     };

//     const handleCourseSelect = (id: string) => {
//         dispatch(setSelectedCourse(id));
//     };

//     const handleConfirm = async () => {
//         if (activeView === 'university' && selectedUniversityId) {
//             const selected = companies.find(
//                 (c) => c._id === selectedUniversityId,
//             );
//             if (selected) {
//                 dispatch(setActiveCompany(selected));
//                 Cookies.set('activeCompany', selected._id);
//                 if (setAsDefault) {
//                     localStorage.setItem('defaultCompany', selected._id);
//                 }
//                 dispatch(switchView('course'));
//             }
//         } else if (activeView === 'course' && selectedCourseId) {
//             const selected = myEnrollments.find(
//                 (e) => e._id === selectedCourseId,
//             );
//             if (selected) {
//                 dispatch(setEnrollment(selected));
//                 await storage.setItem('active_enrolment', selected);
//                 if (setAsDefault) {
//                     localStorage.setItem('defaultEnrollment', selected._id);
//                 }
//                 toast.success(`Switched to ${selected.program.title}`);
//                 dispatch(closeModal());
//                 // router.push('/dashboard/program');
//                 router.refresh();
//             }
//         }
//     };

//     const formatCurrency = (amount: number = 0) => {
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: 'USD',
//             minimumFractionDigits: 2,
//         })
//             .format(amount)
//             .replace('.00', '');
//     };

//     const renderStars = (rating: number = 0) => {
//         return Array(5)
//             .fill(0)
//             .map((_, i) => (
//                 <Star
//                     key={i}
//                     className={cn(
//                         'w-3 h-3 fill-current',
//                         i < Math.floor(rating)
//                             ? 'text-yellow-400'
//                             : 'text-gray-300',
//                     )}
//                 />
//             ));
//     };

//     useEffect(() => {
//         if (isOpen) {
//             const activeCompanyFromCookies = Cookies.get('activeCompany');
//             if (activeCompanyFromCookies) {
//                 const matchingCompany = companies.find(
//                     (company) => company._id === activeCompanyFromCookies,
//                 );

//                 if (matchingCompany) {
//                     handleUniversitySelect(activeCompanyFromCookies);
//                 } else {
//                     handleUniversitySelect('');
//                 }
//             } else {
//                 handleUniversitySelect('');
//             }
//         }
//     }, [isOpen, companies]);

//     const renderUniversitySelection = () => (
//         <div className='space-y-6 py-3'>
//             <div className='relative'>
//                 <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
//                     <svg
//                         className='w-4 h-4 text-gray-500'
//                         aria-hidden='true'
//                         xmlns='http://www.w3.org/2000/svg'
//                         fill='none'
//                         viewBox='0 0 20 20'
//                     >
//                         <path
//                             stroke='currentColor'
//                             strokeLinecap='round'
//                             strokeLinejoin='round'
//                             strokeWidth='2'
//                             d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z'
//                         />
//                     </svg>
//                 </div>
//                 <Input
//                     className='pl-10'
//                     placeholder='Search companies...'
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//             </div>

//             <div className='space-y-3 max-h-[400px] overflow-y-auto pr-1'>
//                 {filteredCompanies.map((company) => (
//                     <div
//                         key={company._id}
//                         className={cn(
//                             'border rounded-lg p-3 flex gap-3',
//                             selectedUniversityId === company._id &&
//                                 'border-primary-white',
//                         )}
//                     >
//                         <div className='flex-shrink-0'>
//                             <Image
//                                 src={
//                                     company.image ||
//                                     '/images/university-thumbnail.png'
//                                 }
//                                 alt={company.name}
//                                 width={80}
//                                 height={80}
//                                 className='rounded-md object-cover'
//                             />
//                         </div>
//                         <div className='flex-1 min-w-0'>
//                             <div className='flex items-center gap-2'>
//                                 <h3 className='text-sm font-medium'>
//                                     {company.name}
//                                 </h3>
//                                 {company.status === 'active' && (
//                                     <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800'>
//                                         <Check className='w-3 h-3 mr-1' />{' '}
//                                         Active
//                                     </span>
//                                 )}
//                                 {company.status === 'pending' && (
//                                     <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800'>
//                                         <svg
//                                             className='w-3 h-3 mr-1'
//                                             viewBox='0 0 24 24'
//                                             fill='none'
//                                             xmlns='http://www.w3.org/2000/svg'
//                                         >
//                                             <path
//                                                 d='M12 8V12'
//                                                 stroke='currentColor'
//                                                 strokeWidth='2'
//                                                 strokeLinecap='round'
//                                             />
//                                             <path
//                                                 d='M12 16V16.01'
//                                                 stroke='currentColor'
//                                                 strokeWidth='2'
//                                                 strokeLinecap='round'
//                                             />
//                                             <path
//                                                 d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
//                                                 stroke='currentColor'
//                                                 strokeWidth='2'
//                                             />
//                                         </svg>
//                                         Pending
//                                     </span>
//                                 )}
//                                 {company.status === 'inactive' && (
//                                     <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800'>
//                                         <X className='w-3 h-3 mr-1' /> Inactive
//                                     </span>
//                                 )}
//                                 {company.status === undefined && (
//                                     <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800'>
//                                         <X className='w-3 h-3 mr-1' /> undefined
//                                     </span>
//                                 )}
//                             </div>
//                             <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
//                                 {company.description ||
//                                     'No description available.'}
//                             </p>
//                             <div className='flex items-center mt-2 text-xs text-muted-foreground gap-1'>
//                                 <CalendarDays className='h-4 w-4' />
//                                 <p>{company.date ?? 'Dec 16, 1971'}</p>
//                                 <span>|</span>
//                                 <p>{company.time ?? '12:12AM'}</p>
//                             </div>
//                         </div>
//                         <div className='flex items-center'>
//                             {selectedUniversityId === company._id ? (
//                                 <div className='px-4 py-1.5 rounded bg-[#e6ebfa] text-[#0736d1] text-sm font-medium flex items-center'>
//                                     <Check className='w-4 h-4 mr-1' /> Selected
//                                 </div>
//                             ) : (
//                                 <Button
//                                     variant='outline'
//                                     className={cn(
//                                         'px-4 py-1.5 h-auto text-sm',
//                                         'bg-[#0736d1] text-white hover:bg-[#0736d1]/90',
//                                     )}
//                                     onClick={() =>
//                                         handleUniversitySelect(company._id)
//                                     }
//                                 >
//                                     Select
//                                 </Button>
//                             )}
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             <div className='flex items-center space-x-2'>
//                 <Checkbox
//                     id='default'
//                     checked={setAsDefault}
//                     onCheckedChange={(checked) =>
//                         setSetAsDefault(checked as boolean)
//                     }
//                 />
//                 <label
//                     htmlFor='default'
//                     className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
//                 >
//                     Set this selected company as the default
//                 </label>
//             </div>

//             <Button
//                 className='w-full bg-[#0736d1] hover:bg-[#0736d1]/90'
//                 onClick={handleConfirm}
//                 disabled={!selectedUniversityId}
//             >
//                 Next <ArrowRight className='ml-2 h-4 w-4' />
//             </Button>
//         </div>
//     );

//     const renderCourseSelection = () => (
//         <div className='space-y-6 py-3'>
//             {selectedUniversity && (
//                 <div className='border rounded-lg p-3 flex gap-3'>
//                     <div className='flex-shrink-0'>
//                         <Image
//                             src={
//                                 selectedUniversity.image ||
//                                 '/images/university-thumbnail.png'
//                             }
//                             alt={selectedUniversity.name}
//                             width={80}
//                             height={80}
//                             className='rounded-md object-cover'
//                         />
//                     </div>
//                     <div className='flex-1 min-w-0'>
//                         <div className='flex items-center gap-2'>
//                             <h3 className='text-sm font-medium'>
//                                 {selectedUniversity.name}
//                             </h3>
//                             {selectedUniversity.status === 'active' && (
//                                 <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800'>
//                                     <Check className='w-3 h-3 mr-1' /> Active
//                                 </span>
//                             )}
//                         </div>
//                         <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
//                             {selectedUniversity.description ||
//                                 'No description available.'}
//                         </p>
//                         <div className='flex items-center mt-2 text-xs text-muted-foreground'>
//                             <svg
//                                 className='w-3 h-3 mr-1'
//                                 viewBox='0 0 24 24'
//                                 fill='none'
//                                 xmlns='http://www.w3.org/2000/svg'
//                             >
//                                 <path
//                                     d='M8 2V5'
//                                     stroke='currentColor'
//                                     strokeWidth='1.5'
//                                     strokeMiterlimit='10'
//                                     strokeLinecap='round'
//                                     strokeLinejoin='round'
//                                 />
//                                 <path
//                                     d='M16 2V5'
//                                     stroke='currentColor'
//                                     strokeWidth='1.5'
//                                     strokeMiterlimit='10'
//                                     strokeLinecap='round'
//                                     strokeLinejoin='round'
//                                 />
//                                 <path
//                                     d='M3.5 9.09H20.5'
//                                     stroke='currentColor'
//                                     strokeWidth='1.5'
//                                     strokeMiterlimit='10'
//                                     strokeLinecap='round'
//                                     strokeLinejoin='round'
//                                 />
//                                 <path
//                                     d='M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z'
//                                     stroke='currentColor'
//                                     strokeWidth='1.5'
//                                     strokeMiterlimit='10'
//                                     strokeLinecap='round'
//                                     strokeLinejoin='round'
//                                 />
//                             </svg>
//                             {selectedUniversity.date ?? 'Dec 16, 1971'} |{' '}
//                             {selectedUniversity.time ?? '12:12AM'}
//                         </div>
//                     </div>
//                     <div className='flex items-center'>
//                         <Button
//                             variant='outline'
//                             size='sm'
//                             className='text-xs h-8'
//                             onClick={() => dispatch(switchView('university'))}
//                         >
//                             Change Company
//                         </Button>
//                     </div>
//                 </div>
//             )}

//             <div className='relative'>
//                 <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
//                     <svg
//                         className='w-4 h-4 text-gray-500'
//                         aria-hidden='true'
//                         xmlns='http://www.w3.org/2000/svg'
//                         fill='none'
//                         viewBox='0 0 20 20'
//                     >
//                         <path
//                             stroke='currentColor'
//                             strokeLinecap='round'
//                             strokeLinejoin='round'
//                             strokeWidth='2'
//                             d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z'
//                         />
//                     </svg>
//                 </div>
//                 <Input
//                     className='pl-10'
//                     placeholder='Search programs...'
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//             </div>

//             <Tabs
//                 defaultValue='program'
//                 value={activeTab}
//                 onValueChange={setActiveTab}
//             >
//                 <TabsList className='grid w-full grid-cols-3'>
//                     <TabsTrigger value='program' className='text-xs'>
//                         <svg
//                             className='w-4 h-4 mr-1'
//                             viewBox='0 0 24 24'
//                             fill='none'
//                             xmlns='http://www.w3.org/2000/svg'
//                         >
//                             <path
//                                 d='M10.05 2.53L4.03 6.46C2.1 7.72 2.1 10.54 4.03 11.8L10.05 15.73C11.13 16.44 12.91 16.44 13.99 15.73L19.98 11.8C21.9 10.54 21.9 7.73 19.98 6.47L13.99 2.54C12.91 1.82 11.13 1.82 10.05 2.53Z'
//                                 stroke='currentColor'
//                                 strokeWidth='1.5'
//                                 strokeLinecap='round'
//                                 strokeLinejoin='round'
//                             />
//                             <path
//                                 d='M5.63 13.08L5.62 17.77C5.62 19.04 6.6 20.4 7.8 20.8L10.99 21.86C11.54 22.04 12.45 22.04 13.01 21.86L16.2 20.8C17.4 20.4 18.38 19.04 18.38 17.77V13.13'
//                                 stroke='currentColor'
//                                 strokeWidth='1.5'
//                                 strokeLinecap='round'
//                                 strokeLinejoin='round'
//                             />
//                             <path
//                                 d='M21.4 15V9'
//                                 stroke='currentColor'
//                                 strokeWidth='1.5'
//                                 strokeLinecap='round'
//                                 strokeLinejoin='round'
//                             />
//                         </svg>
//                         Programs ({myEnrollments.length})
//                     </TabsTrigger>
//                     <TabsTrigger value='courses' className='text-xs'>
//                         <svg
//                             className='w-4 h-4 mr-1'
//                             viewBox='0 0 24 24'
//                             fill='none'
//                             xmlns='http://www.w3.org/2000/svg'
//                         >
//                             <path
//                                 d='M22 16.74V4.67C22 3.47 21.02 2.58 19.83 2.68H19.77C17.67 2.86 14.48 3.93 12.7 5.05L12.53 5.16C12.24 5.34 11.76 5.34 11.47 5.16L11.22 5.01C9.44 3.9 6.26 2.84 4.16 2.67C2.97 2.57 2 3.47 2 4.66V16.74C2 17.7 2.78 18.6 3.74 18.72L4.03 18.76C6.2 19.05 9.55 20.15 11.47 21.2L11.51 21.22C11.78 21.37 12.21 21.37 12.47 21.22C14.39 20.16 17.75 19.05 19.93 18.76L20.26 18.72C21.22 18.6 22 17.7 22 16.74Z'
//                                 stroke='currentColor'
//                                 strokeWidth='1.5'
//                                 strokeLinecap='round'
//                                 strokeLinejoin='round'
//                             />
//                             <path
//                                 d='M12 5.49V20.49'
//                                 stroke='currentColor'
//                                 strokeWidth='1.5'
//                                 strokeLinecap='round'
//                                 strokeLinejoin='round'
//                             />
//                             <path
//                                 d='M7.75 8.49H5.5'
//                                 stroke='currentColor'
//                                 strokeWidth='1.5'
//                                 strokeLinecap='round'
//                                 strokeLinejoin='round'
//                             />
//                             <path
//                                 d='M8.5 11.49H5.5'
//                                 stroke='currentColor'
//                                 strokeWidth='1.5'
//                                 strokeLinecap='round'
//                                 strokeLinejoin='round'
//                             />
//                         </svg>
//                         Courses (0)
//                     </TabsTrigger>
//                     <TabsTrigger value='interviews' className='text-xs'>
//                         <svg
//                             className='w-4 h-4 mr-1'
//                             viewBox='0 0 24 24'
//                             fill='none'
//                             xmlns='http://www.w3.org/2000/svg'
//                         >
//                             <path
//                                 d='M8.5 19H8C4 19 2 18 2 13V8C2 4 4 2 8 2H16C20 2 22 4 22 8V13C22 17 20 19 16 19H15.5C15.19 19 14.89 19.15 14.7 19.4L13.2 21.4C12.54 22.28 11.46 22.28 10.8 21.4L9.3 19.4C9.14 19.18 8.77 19 8.5 19Z'
//                                 stroke='currentColor'
//                                 strokeWidth='1.5'
//                                 strokeMiterlimit='10'
//                                 strokeLinecap='round'
//                                 strokeLinejoin='round'
//                             />
//                             <path
//                                 d='M15.9965 11H16.0054'
//                                 stroke='currentColor'
//                                 strokeWidth='2'
//                                 strokeLinecap='round'
//                                 strokeLinejoin='round'
//                             />
//                             <path
//                                 d='M11.9955 11H12.0045'
//                                 stroke='currentColor'
//                                 strokeWidth='2'
//                                 strokeLinecap='round'
//                                 strokeLinejoin='round'
//                             />
//                             <path
//                                 d='M7.99451 11H8.00349'
//                                 stroke='currentColor'
//                                 strokeWidth='2'
//                                 strokeLinecap='round'
//                                 strokeLinejoin='round'
//                             />
//                         </svg>
//                         Interviews (0)
//                     </TabsTrigger>
//                 </TabsList>
//                 <TabsContent
//                     value='program'
//                     className='space-y-3 max-h-[400px] overflow-y-auto pr-1 mt-4'
//                 >
//                     {filteredEnrollments.length === 0 ? (
//                         <div className='text-center py-8'>
//                             <h2 className='text-xl font-semibold'>
//                                 No enrollment found
//                             </h2>
//                         </div>
//                     ) : (
//                         filteredEnrollments.map((enroll) => (
//                             <div
//                                 key={enroll._id}
//                                 className={cn(
//                                     'border rounded-lg p-3',
//                                     selectedCourseId === enroll._id &&
//                                         'border-[#0736d1]',
//                                 )}
//                             >
//                                 <div className='flex gap-3'>
//                                     <div className='flex-shrink-0 relative'>
//                                         <Image
//                                             src={
//                                                 enroll.image ||
//                                                 enroll.program.instructor
//                                                     .image ||
//                                                 '/clients/Abidur Rahman.jpg'
//                                             }
//                                             alt={enroll.program.title}
//                                             width={80}
//                                             height={80}
//                                             className='rounded-md object-cover'
//                                         />
//                                         <div className='absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-0.5'>
//                                             {(enroll.rating || 0).toFixed(1)}
//                                         </div>
//                                     </div>
//                                     <div className='flex-1 min-w-0'>
//                                         <div className='flex items-center gap-2 flex-wrap'>
//                                             <h3 className='text-sm font-medium'>
//                                                 {enroll.program.title}
//                                             </h3>
//                                             {enroll.status === 'approved' && (
//                                                 <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800'>
//                                                     <Check className='w-3 h-3 mr-1' />{' '}
//                                                     Approved
//                                                 </span>
//                                             )}
//                                             {enroll.status === 'pending' && (
//                                                 <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800'>
//                                                     <svg
//                                                         className='w-3 h-3 mr-1'
//                                                         viewBox='0 0 24 24'
//                                                         fill='none'
//                                                         xmlns='http://www.w3.org/2000/svg'
//                                                     >
//                                                         <path
//                                                             d='M12 8V12'
//                                                             stroke='currentColor'
//                                                             strokeWidth='2'
//                                                             strokeLinecap='round'
//                                                         />
//                                                         <path
//                                                             d='M12 16V16.01'
//                                                             stroke='currentColor'
//                                                             strokeWidth='2'
//                                                             strokeLinecap='round'
//                                                         />
//                                                         <path
//                                                             d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
//                                                             stroke='currentColor'
//                                                             strokeWidth='2'
//                                                         />
//                                                     </svg>
//                                                     Pending
//                                                 </span>
//                                             )}
//                                             {enroll.status === 'trial' && (
//                                                 <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
//                                                     <Check className='w-3 h-3 mr-1' />{' '}
//                                                     Trial
//                                                 </span>
//                                             )}
//                                         </div>

//                                         <div className='flex items-center mt-1 gap-1'>
//                                             <div className='text-xs text-muted-foreground'>
//                                                 {enroll.organization.name}
//                                             </div>
//                                         </div>

//                                         <div className='flex items-center mt-1 gap-2'>
//                                             <div className='flex items-center gap-1'>
//                                                 <Image
//                                                     src={
//                                                         enroll.program
//                                                             .instructor.image ||
//                                                         '/clients/Abidur Rahman.jpg'
//                                                     }
//                                                     alt={
//                                                         enroll.program
//                                                             .instructor.name
//                                                     }
//                                                     width={16}
//                                                     height={16}
//                                                     className='rounded-full'
//                                                 />
//                                                 <span className='text-xs text-muted-foreground'>
//                                                     {
//                                                         enroll.program
//                                                             .instructor.name
//                                                     }
//                                                 </span>
//                                             </div>
//                                             <div className='text-xs text-muted-foreground flex items-center gap-1'>
//                                                 <CalendarDays className='h-4 w-4' />
//                                                 <p>
//                                                     {enroll.date ??
//                                                         'Dec 16, 1971'}
//                                                 </p>
//                                                 <span>|</span>
//                                                 <p>
//                                                     {enroll.time ?? '12:12AM'}
//                                                 </p>
//                                             </div>
//                                         </div>

//                                         <div className='grid grid-cols-3 gap-2 mt-2'>
//                                             <div>
//                                                 <div className='text-xs text-muted-foreground'>
//                                                     Total Fee
//                                                 </div>
//                                                 <div className='text-xs font-medium'>
//                                                     {formatCurrency(
//                                                         enroll.totalFee,
//                                                     )}
//                                                 </div>
//                                             </div>
//                                             <div>
//                                                 <div className='text-xs text-muted-foreground'>
//                                                     Paid
//                                                 </div>
//                                                 <div className='text-xs font-medium text-green-600'>
//                                                     {formatCurrency(
//                                                         enroll.paid,
//                                                     )}
//                                                 </div>
//                                             </div>
//                                             <div>
//                                                 <div className='text-xs text-muted-foreground'>
//                                                     Due
//                                                 </div>
//                                                 <div className='text-xs font-medium text-amber-600'>
//                                                     {formatCurrency(enroll.due)}
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className='flex items-center gap-2 mt-2'>
//                                             <div className='flex'>
//                                                 {renderStars(enroll.rating)}
//                                             </div>
//                                             <div className='text-xs text-muted-foreground'>
//                                                 (
//                                                 {(enroll.rating || 0).toFixed(
//                                                     1,
//                                                 )}
//                                                 )
//                                             </div>
//                                         </div>
//                                     </div>

//                                     <div className='flex flex-col items-end justify-between'>
//                                         <div className='relative h-12 w-12'>
//                                             <svg
//                                                 viewBox='0 0 36 36'
//                                                 className='h-12 w-12 -rotate-90'
//                                             >
//                                                 <path
//                                                     d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
//                                                     fill='none'
//                                                     stroke='#eee'
//                                                     strokeWidth='3'
//                                                     strokeDasharray='100, 100'
//                                                 />
//                                                 <path
//                                                     d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
//                                                     fill='none'
//                                                     stroke={
//                                                         (enroll.progress || 0) >
//                                                         0
//                                                             ? '#0736d1'
//                                                             : '#eee'
//                                                     }
//                                                     strokeWidth='3'
//                                                     strokeDasharray={`${enroll.progress || 0}, 100`}
//                                                 />
//                                             </svg>
//                                             <div className='absolute inset-0 flex items-center justify-center text-xs font-medium'>
//                                                 {enroll.progress || 0}%
//                                             </div>
//                                         </div>

//                                         {selectedCourseId === enroll._id ? (
//                                             <div className='px-4 py-1.5 rounded bg-[#e6ebfa] text-[#0736d1] text-xs font-medium flex items-center'>
//                                                 <Check className='w-3 h-3 mr-1' />{' '}
//                                                 Selected
//                                             </div>
//                                         ) : (
//                                             <Button
//                                                 variant='outline'
//                                                 className={cn(
//                                                     'px-4 py-1 h-auto text-xs',
//                                                     enroll.status ===
//                                                         'approved' ||
//                                                         enroll.status ===
//                                                             'trial'
//                                                         ? 'bg-[#0736d1] text-white hover:bg-[#0736d1]/90'
//                                                         : 'bg-gray-100 text-gray-500',
//                                                 )}
//                                                 onClick={() =>
//                                                     handleCourseSelect(
//                                                         enroll._id,
//                                                     )
//                                                 }
//                                                 disabled={
//                                                     enroll.status !==
//                                                         'approved' &&
//                                                     enroll.status !== 'trial'
//                                                 }
//                                             >
//                                                 Switch to Program{' '}
//                                                 <ArrowRight className='ml-1 h-3 w-3' />
//                                             </Button>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         ))
//                     )}
//                 </TabsContent>
//                 <TabsContent value='courses' className='mt-4'>
//                     <div className='flex items-center justify-center h-40 border rounded-md'>
//                         <p className='text-muted-foreground'>
//                             Courses content will appear here
//                         </p>
//                     </div>
//                 </TabsContent>
//                 <TabsContent value='interviews' className='mt-4'>
//                     <div className='flex items-center justify-center h-40 border rounded-md'>
//                         <p className='text-muted-foreground'>
//                             Interviews content will appear here
//                         </p>
//                     </div>
//                 </TabsContent>
//             </Tabs>

//             <div className='flex items-center space-x-2'>
//                 <Checkbox
//                     id='default-program'
//                     checked={setAsDefault}
//                     onCheckedChange={(checked) =>
//                         setSetAsDefault(checked as boolean)
//                     }
//                 />
//                 <label
//                     htmlFor='default-program'
//                     className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
//                 >
//                     Set this selected program as the default
//                 </label>
//             </div>

//             <div className='flex gap-2'>
//                 <Button
//                     variant='outline'
//                     onClick={() => dispatch(switchView('university'))}
//                 >
//                     Back
//                 </Button>
//                 <Button
//                     className='flex-1 bg-[#0736d1] hover:bg-[#0736d1]/90'
//                     onClick={handleConfirm}
//                     disabled={!selectedCourseId}
//                 >
//                     Go to Program <ArrowRight className='ml-2 h-4 w-4' />
//                 </Button>
//             </div>
//         </div>
//     );

//     return (
//         <GlobalModal
//             open={isOpen}
//             setOpen={() => dispatch(closeModal())}
//             title={
//                 activeView === 'university'
//                     ? 'Select University'
//                     : 'Select Program'
//             }
//             subTitle={
//                 activeView === 'university'
//                     ? 'Select a university to continue'
//                     : 'Select a program to proceed'
//             }
//         >
//             {activeView === 'university'
//                 ? renderUniversitySelection()
//                 : renderCourseSelection()}
//         </GlobalModal>
//     );
// }
// components/CombinedSelectionModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    X,
    ArrowRight,
    Check,
    Star,
    CalendarDays,
    Calendar,
    University,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
    switchView,
    setSelectedUniversity,
    setSelectedCourse,
} from '@/redux/features/selectionModalSlice';
import storage from '@/utils/storage';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { UniversityIcon } from '@/components/svgs/icons';

interface Company {
    _id: string;
    name: string;
    description?: string;
    image?: string;
    status?: 'active' | 'pending' | 'inactive';
    date?: string;
    time?: string;
}

interface Enrollment {
    _id: string;
    status: string;
    program: {
        title: string;
        instructor: { name: string; image: string };
    };
    session: { name: string };
    organization: { name: string };
    image?: string;
    date?: string;
    time?: string;
    totalFee?: number;
    paid?: number;
    due?: number;
    rating?: number;
    progress?: number;
}

export function CombinedSelectionModal() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { myEnrollments } = useSelector((state: RootState) => state.auth);
    const { companies, activeCompany } = useSelector(
        (state: RootState) => state.company,
    );
    const { isOpen, activeView, selectedUniversityId, selectedCourseId } =
        useSelector((state: RootState) => state.selectionModal);

    const [searchQuery, setSearchQuery] = useState('');
    const [setAsDefault, setSetAsDefault] = useState(false);
    const [activeTab, setActiveTab] = useState('program');

    const filteredCompanies = companies.filter((company) =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    const filteredEnrollments = myEnrollments.filter((enroll) =>
        enroll.program.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const selectedUniversity = companies.find(
        (company) =>
            company._id ===
            (selectedUniversityId || Cookies.get('activeCompany')),
    );

    const handleUniversitySelect = (id: string) => {
        dispatch(setSelectedUniversity(id));
    };

    const handleCourseSelect = (id: string) => {
        dispatch(setSelectedCourse(id));
    };

    const handleConfirm = async () => {
        if (activeView === 'university' && selectedUniversityId) {
            const selected = companies.find(
                (c) => c._id === selectedUniversityId,
            );
            if (selected) {
                dispatch(setActiveCompany(selected));
                Cookies.set('activeCompany', selected._id);
                if (setAsDefault) {
                    localStorage.setItem('defaultCompany', selected._id);
                }
                dispatch(switchView('course'));
            }
        } else if (activeView === 'course' && selectedCourseId) {
            const selected = myEnrollments.find(
                (e) => e._id === selectedCourseId,
            );
            if (selected) {
                dispatch(setEnrollment(selected));
                await storage.setItem('active_enrolment', selected);
                Cookies.set('active_enrolment', selected);
                if (setAsDefault) {
                    localStorage.setItem('defaultEnrollment', selected._id);
                }
                toast.success(`Switched to ${selected.program.title}`);
                dispatch(closeModal());
                window.location.href = '/dashboard/program';
            }
        }
    };

    const formatCurrency = (amount: number) => {
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

    useEffect(() => {
        if (isOpen) {
            const activeCompanyFromCookies = Cookies.get('activeCompany');
            if (activeCompanyFromCookies) {
                const matchingCompany = companies.find(
                    (company) => company._id === activeCompanyFromCookies,
                );
                if (matchingCompany) {
                    handleUniversitySelect(activeCompanyFromCookies);
                } else {
                    handleUniversitySelect('');
                }
            } else {
                handleUniversitySelect('');
            }

            const activeEnrollment = storage.getItem('active_enrolment');
            if (activeEnrollment && activeEnrollment._id) {
                const matchingEnrollment = myEnrollments.find(
                    (enroll) => enroll._id === activeEnrollment._id,
                );
                if (matchingEnrollment) {
                    handleCourseSelect(matchingEnrollment._id);
                }
            }
        }
    }, [isOpen, companies, myEnrollments]);

    const renderUniversitySelection = () => (
        <div className='space-y-4 py-2'>
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
                    placeholder='Search companies...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className='space-y-4 max-h-[400px] overflow-y-auto pr-1'>
                {filteredCompanies.map((company) => (
                    <div
                        key={company._id}
                        className={cn(
                            'border rounded-lg p-3 flex gap-3',
                            selectedUniversityId === company._id &&
                                'border-primary-white',
                        )}
                    >
                        <div className='flex-shrink-0'>
                            <Image
                                src={
                                    company.image ||
                                    '/images/university-thumbnail.png'
                                }
                                alt={company.name}
                                width={80}
                                height={80}
                                className='rounded-md object-cover'
                            />
                        </div>
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2'>
                                <h3 className='text-sm font-medium'>
                                    {company.name}
                                </h3>
                                {company.status === 'active' && (
                                    <span className='rounded-full inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800'>
                                        <Check className='w-3 h-3 mr-1' />{' '}
                                        Active
                                    </span>
                                )}
                                {company.status === 'pending' && (
                                    <span className='rounded-full inline-flex items-center px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800'>
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
                                {company.status === 'inactive' && (
                                    <span className='rounded-full inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800'>
                                        <X className='w-3 h-3 mr-1' /> Inactive
                                    </span>
                                )}
                                {company.status === undefined && (
                                    <span className='rounded-full inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800'>
                                        <X className='w-3 h-3 mr-1' /> undefined
                                    </span>
                                )}
                            </div>
                            <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                                {company.description ||
                                    'No description available.'}
                            </p>
                            <div className='flex items-center mt-2 text-xs text-muted-foreground gap-1'>
                                <CalendarDays className='h-4 w-4' />
                                <p>{company.date ?? 'Dec 16, 1971'}</p>
                                <span>|</span>
                                <p>{company.time ?? '12:12AM'}</p>
                            </div>
                        </div>
                        <div className='flex items-center'>
                            {selectedUniversityId === company._id ? (
                                <div className='px-4 py-1.5 rounded bg-[#e6ebfa] text-[#0736d1] text-sm font-medium flex items-center'>
                                    <Check className='w-4 h-4 mr-1' /> Selected
                                </div>
                            ) : (
                                <Button
                                    variant='outline'
                                    className={cn(
                                        'px-4 py-1.5 h-auto text-sm',
                                        'bg-[#0736d1] text-white hover:bg-[#0736d1]/90',
                                    )}
                                    onClick={() =>
                                        handleUniversitySelect(company._id)
                                    }
                                >
                                    Select
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className='flex items-center space-x-2 border-b border-forground-border pb-2'>
                <Checkbox
                    id='default'
                    checked={setAsDefault}
                    onCheckedChange={(checked) =>
                        setSetAsDefault(checked as boolean)
                    }
                />
                <label
                    htmlFor='default'
                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                    Set this selected company as the default
                </label>
            </div>

            <div className='flex justify-center'>
                <Button
                    onClick={handleConfirm}
                    disabled={!selectedUniversityId}
                >
                    Go to Program <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
            </div>
        </div>
    );

    const renderCourseSelection = () => (
        <div className='py-3'>
            <div className='space-y-3 bg-background p-3 rounded-lg'>
                {selectedUniversity && (
                    <div className='border rounded-lg bg-foreground p-2.5 flex gap-3'>
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
                                    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                                        <Check className='w-3 h-3 mr-1' />{' '}
                                        Active
                                    </span>
                                )}
                            </div>
                            <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                                {selectedUniversity.description ||
                                    'No description available.'}
                            </p>
                            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                                <CalendarDays size={16} />
                                {selectedUniversity.date ??
                                    'Dec 16, 1971'} |{' '}
                                {selectedUniversity.time ?? '12:12AM'}
                            </div>
                        </div>
                        <div className='flex items-center'>
                            <Button
                                variant='primary_light'
                                size='sm'
                                className='text-xs h-8'
                                onClick={() =>
                                    dispatch(switchView('university'))
                                }
                            >
                                <University size={16} /> Change Company
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
                    <TabsTrigger
                        value='courses'
                        className='text-xs data-[state=active]:text-primary-white shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-white border-b rounded-none data-[state=active]:border-b-primary-white'
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
                        Courses (0)
                    </TabsTrigger>
                    <TabsTrigger
                        value='interviews'
                        className='text-xs data-[state=active]:text-primary-white shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-white border-b rounded-none data-[state=active]:border-b-primary-white'
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
                        Interviews (0)
                    </TabsTrigger>
                </TabsList>
                <TabsContent
                    value='program'
                    className='space-y-3 max-h-[400px] overflow-y-auto pr-1 mt-2'
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
                                    'border rounded-lg p-2.5',
                                    selectedCourseId === enroll._id &&
                                        'border-primary-white',
                                )}
                            >
                                <div className='grid grid-cols-6 gap-1'>
                                    <div className='relative'>
                                        <Image
                                            src={
                                                enroll.image ||
                                                enroll.program.instructor
                                                    .image ||
                                                '/clients/Abidur Rahman.jpg'
                                            }
                                            alt={enroll.program.title}
                                            width={80}
                                            height={80}
                                            className='rounded-md object-cover'
                                        />
                                        <div className='bg-black/70 text-white text-xs text-center py-0.5'>
                                            {(enroll.rating || 0).toFixed(1)}
                                        </div>
                                    </div>

                                    <div className='col-span-5'>
                                        <div className='min-w-0'>
                                            <div className='flex items-center gap-2 flex-wrap'>
                                                <h3 className='text-sm font-medium'>
                                                    {enroll.program.title}
                                                </h3>
                                                {enroll.status ===
                                                    'approved' && (
                                                    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                                                        <Check className='w-3 h-3 mr-1' />{' '}
                                                        Approved
                                                    </span>
                                                )}
                                                {enroll.status ===
                                                    'pending' && (
                                                    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800'>
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
                                                {enroll.status === 'trial' && (
                                                    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                                                        <Check className='w-3 h-3 mr-1' />{' '}
                                                        Trial
                                                    </span>
                                                )}
                                            </div>

                                            <div className='flex items-center mt-1 gap-1'>
                                                <div className='text-xs text-muted-foreground'>
                                                    {enroll.organization.name}
                                                </div>
                                            </div>

                                            <div className='flex items-center mt-1 gap-2'>
                                                <div className='flex items-center gap-1'>
                                                    <Image
                                                        src={
                                                            enroll.program
                                                                .instructor
                                                                .image ||
                                                            '/clients/Abidur Rahman.jpg'
                                                        }
                                                        alt={
                                                            enroll.program
                                                                .instructor.name
                                                        }
                                                        width={16}
                                                        height={16}
                                                        className='rounded-full'
                                                    />
                                                    <span className='text-xs text-muted-foreground'>
                                                        {
                                                            enroll.program
                                                                .instructor.name
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
                                                    {renderStars(enroll.rating)}
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

                                            {selectedCourseId === enroll._id ? (
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
                                                            ? ''
                                                            : '',
                                                    )}
                                                    onClick={() =>
                                                        handleCourseSelect(
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
                            </div>
                        ))
                    )}
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

            <div className='flex gap-2'>
                <Button
                    variant='outline'
                    onClick={() => dispatch(switchView('university'))}
                >
                    Back
                </Button>
                <Button
                    className='flex-1 bg-[#0736d1] hover:bg-[#0736d1]/90'
                    onClick={handleConfirm}
                    disabled={!selectedCourseId}
                >
                    Go to Program <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
            </div>
        </div>
    );

    return (
        <GlobalModal
            open={isOpen}
            setOpen={() => dispatch(closeModal())}
            title={
                activeView === 'university'
                    ? 'Select Company/University'
                    : 'Switch Bootcamp'
            }
            subTitle={
                activeView === 'university'
                    ? 'Select a university or organization to continue your journey'
                    : "If you wish to change to another program, please click on 'Switch' and proceed."
            }
            className='w-full max-w-4xl bg-white'
            allowFullScreen={false}
        >
            {activeView === 'university'
                ? renderUniversitySelection()
                : renderCourseSelection()}
        </GlobalModal>
    );
}

export default CombinedSelectionModal;
