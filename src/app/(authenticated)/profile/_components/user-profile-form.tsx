'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

// UI Components
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

// Icons
import {
    CalendarIcon,
    Check,
    ExternalLink,
    FileText,
    Globe,
    Info,
    Instagram,
    Linkedin,
    Github,
    Facebook,
    X,
    UserRound,
    CircleCheckBig,
    CircleX,
    CloudUpload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/redux/hooks';
import Image from 'next/image';

// Form validation schema
const FormSchema = z.object({
    firstName: z.string().min(2, { message: 'First name is required' }),
    lastName: z.string().min(2, { message: 'Last name is required' }),
    middleInitial: z.string().optional(),
    gender: z.string().min(1, { message: 'Gender is required' }),
    education: z.string().min(1, { message: 'Education is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    phone: z.string().min(10, { message: 'Valid phone number is required' }),
    street: z.string().min(3, { message: 'Street is required' }),
    city: z.string().min(2, { message: 'City is required' }),
    state: z.string().min(1, { message: 'State is required' }),
    country: z.string().min(1, { message: 'Country is required' }),
    facebook: z
        .string()
        .url({ message: 'Invalid URL' })
        .optional()
        .or(z.literal('')),
    linkedin: z
        .string()
        .url({ message: 'Invalid URL' })
        .optional()
        .or(z.literal('')),
    instagram: z
        .string()
        .url({ message: 'Invalid URL' })
        .optional()
        .or(z.literal('')),
    x: z.string().url({ message: 'Invalid URL' }).optional().or(z.literal('')),
    website: z
        .string()
        .url({ message: 'Invalid URL' })
        .optional()
        .or(z.literal('')),
    github: z
        .string()
        .url({ message: 'Invalid URL' })
        .optional()
        .or(z.literal('')),
    dateOfBirth: z.date(),
    about: z.string().min(10, {
        message: 'About section should have at least 10 characters',
    }),
});

export default function UserProfileForm() {
    const dispatch = useDispatch();
    const { user } = useAppSelector((state) => state.auth);

    // Form state
    const [date, setDate] = useState(new Date(2000, 0, 1));
    const [memberSince, setMemberSince] = useState(
        user?.createdAt ? new Date(user.createdAt) : new Date(2010, 0, 12),
    );
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeFileName, setResumeFileName] = useState(
        user?.personalData?.resume
            ? user.personalData.resume.split('/').pop()
            : '',
    );
    const [resumeError, setResumeError] = useState(false);
    const [streetCharCount, setStreetCharCount] = useState(640);
    const [cityCharCount, setCityCharCount] = useState(835);
    const [aboutCharCount, setAboutCharCount] = useState(834);
    const [phoneNumber, setPhoneNumber] = useState<string>(
        typeof user?.phone === 'string' ? user.phone : '919876543210',
    );

    // Form setup
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
    } = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            middleInitial: user?.middleInitial || '',
            gender: user?.gender || 'male',
            education: user?.education || 'bachelors',
            email: user?.email || 'johndoe123@gmail.com',
            phone:
                typeof user?.phone === 'string' ? user.phone : '919876543210',
            street: user?.personalData?.address?.street || '',
            city: user?.personalData?.address?.city || '',
            state: user?.personalData?.address?.state || '',
            country: user?.personalData?.address?.country || '',
            facebook:
                user?.personalData?.socialMedia?.facebook ||
                'https://www.facebook.com',
            linkedin:
                user?.personalData?.socialMedia?.linkedin ||
                'https://www.linkedin.com',
            instagram:
                user?.personalData?.socialMedia?.instagram ||
                'https://www.instagram.com',
            x: user?.personalData?.socialMedia?.twitter || 'https://www.x.com',
            website: user?.website || 'https://www.johndoe.com',
            github:
                user?.personalData?.socialMedia?.github ||
                'https://www.github.com',
            about:
                user?.about ||
                "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
        },
    });

    // Load user data when available
    useEffect(() => {
        if (user) {
            reset({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                middleInitial: user.middleInitial || '',
                gender: user.gender || 'male',
                education: user.education || 'bachelors',
                email: user.email || 'johndoe123@gmail.com',
                phone:
                    typeof user.phone === 'string'
                        ? user.phone
                        : '919876543210',
                street: user.personalData?.address?.street || '',
                city: user.personalData?.address?.city || '',
                state: user.personalData?.address?.state || '',
                country: user.personalData?.address?.country || '',
                facebook:
                    user.personalData?.socialMedia?.facebook ||
                    'https://www.facebook.com',
                linkedin:
                    user.personalData?.socialMedia?.linkedin ||
                    'https://www.linkedin.com',
                instagram:
                    user.personalData?.socialMedia?.instagram ||
                    'https://www.instagram.com',
                x:
                    user.personalData?.socialMedia?.twitter ||
                    'https://www.x.com',
                website: user.website || 'https://www.johndoe.com',
                github:
                    user.personalData?.socialMedia?.github ||
                    'https://www.github.com',
                about:
                    user.about ||
                    'Lorem ipsum is simply dummy text of the printing and typesetting industry.',
            });

            setDate(
                user.dateOfBirth
                    ? new Date(user.dateOfBirth)
                    : new Date(2000, 0, 1),
            );
            setMemberSince(
                user.createdAt
                    ? new Date(user.createdAt)
                    : new Date(2010, 0, 12),
            );
            setPhoneNumber((user.phone || '919876543210') as string);

            if (user.personalData?.resume) {
                setResumeFileName(user.personalData.resume.split('/').pop());
                setResumeError(false);
            }
        }
    }, [user, reset]);

    // Handle date changes
    useEffect(() => {
        setValue('dateOfBirth', date);
    }, [date, setValue]);

    // Handle resume file selection
    interface ResumeChangeEvent extends React.ChangeEvent<HTMLInputElement> {
        target: HTMLInputElement & { files: FileList };
    }

    const handleResumeChange = (e: ResumeChangeEvent) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFile(file);
            setResumeFileName(file.name);
            setResumeError(false);

            // In a real application, you'd upload the file here
            // and store the returned URL in Redux
            /*
        const formData = new FormData();
        formData.append('file', file);
        dispatch(uploadDocument(formData))
          .then((response) => {
          // Handle successful upload
          })
          .catch((error) => {
          setResumeError(true);
          toast.error('Failed to upload resume');
          });
        */
        }
    };

    // Handle form submission
    const onSubmit = (data: any) => {
        // Add the date and additional fields to the data
        const formData = {
            ...data,
            dateOfBirth: date.toISOString(),
            phone: phoneNumber,
            fullName: `${data.firstName} ${data.middleInitial ? data.middleInitial + ' ' : ''}${data.lastName}`,
            personalData: {
                resume: resumeFile
                    ? resumeFileName
                    : user?.personalData?.resume,
                address: {
                    street: data.street,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                },
                socialMedia: {
                    facebook: data.facebook,
                    linkedin: data.linkedin,
                    instagram: data.instagram,
                    twitter: data.x,
                    github: data.github,
                },
            },
        };

        // In a real application, dispatch the update action
        /*
        dispatch(updateUserProfile(formData))
          .then(() => {
            toast.success('Profile updated successfully!');
          })
          .catch((error) => {
            toast.error('Failed to update profile');
          });
        */

        // For now, just show a toast success message
        console.log('Form submitted:', formData);
        toast.success('Profile updated successfully!');
    };

    return (
        <div className='max-w-4xl mx-auto'>
            <style jsx global>{`
                .react-tel-input .form-control {
                    width: 100%;
                    height: 40px;
                    padding-left: 48px;
                    font-size: 16px;
                    border-color: hsl(var(--input));
                    border-radius: 0.375rem;
                }
                .react-tel-input .flag-dropdown {
                    background-color: white;
                    border-color: hsl(var(--input));
                    border-radius: 0.375rem 0 0 0.375rem;
                }
                .react-tel-input .selected-flag {
                    padding: 0 8px 0 11px;
                    border-radius: 0.375rem 0 0 0.375rem;
                }
                .react-tel-input .country-list {
                    border-radius: 0.375rem;
                    border-color: hsl(var(--input));
                    box-shadow:
                        0 4px 6px -1px rgba(0, 0, 0, 0.1),
                        0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                .react-tel-input .country-list .country:hover {
                    background-color: hsl(var(--accent));
                }
                .react-tel-input .country-list .country.highlight {
                    background-color: hsl(var(--accent));
                }
            `}</style>

            <div className='flex flex-col'>
                <div className='flex items-center my-3 bg-foreground p-2 gap-2 rounded-lg'>
                    <div className='relative'>
                        <div className='w-10 h-10 rounded-full bg-gray-300 overflow-hidden'>
                            <Image
                                src={user?.profilePicture || ''}
                                height={100}
                                width={100}
                                alt='Profile'
                                className='w-full h-full object-cover'
                            />
                        </div>
                    </div>
                    <div>
                        <h2 className='text-lg font-medium'>
                            {user?.fullName || 'John Doe'}
                        </h2>
                        <p className='text-sm text-gray-500'>
                            {user?.email || 'johndoe123@gmail.com'}{' '}
                            <span className='text-blue-600 cursor-pointer'>
                                Change Email
                            </span>
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Personal Information */}
                    <Card className='mb-3 shadow-none overflow-hidden rounded-lg border-none'>
                        <CardContent className='p-2 bg-foreground'>
                            <div className='flex items-center mb-3 border-b'>
                                <UserRound className='h-4 w-4 mr-2' />
                                <h3 className='text-lg font-medium'>
                                    Personal Information
                                </h3>
                                <Info className='h-4 w-4 ml-2 text-gray-400' />
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                                <div className='space-y-2'>
                                    <Label htmlFor='firstName' className='flex'>
                                        First Name{' '}
                                        <span className='text-red-500 ml-1'>
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id='firstName'
                                        placeholder='Enter first name'
                                        {...register('firstName')}
                                    />
                                    {errors.firstName && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.firstName.message}
                                        </p>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label
                                        htmlFor='middleInitial'
                                        className='flex'
                                    >
                                        Middle Initial (Optional)
                                    </Label>
                                    <Input
                                        id='middleInitial'
                                        placeholder='Enter middle name'
                                        {...register('middleInitial')}
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='lastName' className='flex'>
                                        Last Name{' '}
                                        <span className='text-red-500 ml-1'>
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id='lastName'
                                        placeholder='Enter last name'
                                        {...register('lastName')}
                                    />
                                    {errors.lastName && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.lastName.message}
                                        </p>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='dob' className='flex'>
                                        Date of Birth{' '}
                                        <span className='text-red-500 ml-1'>
                                            *
                                        </span>
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                className={cn(
                                                    'w-full justify-start h-[40px] text-left font-normal',
                                                    !date &&
                                                        'text-muted-foreground',
                                                )}
                                            >
                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                {date ? (
                                                    format(date, 'MMM dd, yyyy')
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0'>
                                            <Calendar
                                                mode='single'
                                                selected={date}
                                                onSelect={(day) =>
                                                    day && setDate(day)
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='gender' className='flex'>
                                        Gender{' '}
                                        <span className='text-red-500 ml-1'>
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        defaultValue={user?.gender || 'male'}
                                        onValueChange={(value) =>
                                            setValue('gender', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select gender' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='male'>
                                                Male
                                            </SelectItem>
                                            <SelectItem value='female'>
                                                Female
                                            </SelectItem>
                                            <SelectItem value='other'>
                                                Other
                                            </SelectItem>
                                            <SelectItem value='prefer-not-to-say'>
                                                Prefer not to say
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.gender.message}
                                        </p>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='education' className='flex'>
                                        Education{' '}
                                        <span className='text-red-500 ml-1'>
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        defaultValue={
                                            user?.education || 'bachelors'
                                        }
                                        onValueChange={(value) =>
                                            setValue('education', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select education' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='highschool'>
                                                High School
                                            </SelectItem>
                                            <SelectItem value='bachelors'>
                                                {`Bachelor's`}
                                            </SelectItem>
                                            <SelectItem value='masters'>
                                                {`Master's`}
                                            </SelectItem>
                                            <SelectItem value='phd'>
                                                PhD
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.education && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.education.message}
                                        </p>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='email' className='flex'>
                                        Email Address{' '}
                                        <span className='text-red-500 ml-1'>
                                            *
                                        </span>{' '}
                                        <span className='text-red-500 ml-1 text-xs'>
                                            (Not Verified)
                                        </span>
                                    </Label>
                                    <Input
                                        id='email'
                                        placeholder='Enter email'
                                        {...register('email')}
                                    />
                                    {errors.email && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='phone' className='flex'>
                                        Phone Number{' '}
                                        <span className='text-red-500 ml-1'>
                                            *
                                        </span>{' '}
                                        <span className='text-green-500 ml-1 text-xs'>
                                            (Verified)
                                        </span>
                                    </Label>
                                    <div className='relative'>
                                        <PhoneInput
                                            country={'in'}
                                            value={phoneNumber as string}
                                            onChange={(phone) => {
                                                setPhoneNumber(phone);
                                                setValue('phone', phone);
                                            }}
                                            inputProps={{
                                                id: 'phone',
                                                name: 'phone',
                                                required: true,
                                            }}
                                            searchPlaceholder='Search country...'
                                            inputStyle={{
                                                background:
                                                    'hsl(var(--background))',
                                            }}
                                            buttonStyle={{
                                                background: 'transparent',
                                            }}
                                        />
                                        <div className='absolute right-3 top-1/2 transform -translate-y-1/2 z-10'>
                                            <Check className='h-5 w-5 text-green-500' />
                                        </div>
                                    </div>
                                    {errors.phone && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.phone.message}
                                        </p>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='resume' className='flex'>
                                        Resume{' '}
                                        <span className='text-red-500 ml-1'>
                                            *
                                        </span>
                                    </Label>
                                    <div className='border rounded-md p-2 relative'>
                                        <input
                                            type='file'
                                            id='resume'
                                            className='opacity-0 absolute inset-0 w-full cursor-pointer'
                                            onChange={handleResumeChange}
                                            accept='.pdf,.doc,.docx'
                                        />
                                        <div className='flex items-center'>
                                            <div className='bg-gray-100 p-0 rounded mr-2'>
                                                <FileText className='h-5 w-5 text-gray-500' />
                                            </div>
                                            <div className='flex-1 truncate'>
                                                <span className='text-sm'>
                                                    {resumeFileName ||
                                                        'Click to upload resume'}
                                                </span>
                                            </div>
                                            <div
                                                className={`ml-2 ${resumeError ? 'text-red-500' : ''}`}
                                            >
                                                {resumeError ? (
                                                    <X className='h-5 w-5' />
                                                ) : resumeFileName ? (
                                                    <Check className='h-5 w-5 text-green-500' />
                                                ) : (
                                                    <CloudUpload className='h-5 w-5' />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-2'>
                                    <Label
                                        htmlFor='memberSince'
                                        className='flex'
                                    >
                                        Member Since{' '}
                                        <span className='text-red-500 ml-1'>
                                            *
                                        </span>
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                className={cn(
                                                    'w-full justify-start text-left font-normal cursor-not-allowed',
                                                    !memberSince &&
                                                        'text-muted-foreground',
                                                )}
                                                disabled
                                            >
                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                {memberSince ? (
                                                    format(
                                                        memberSince,
                                                        'MMM dd, yyyy',
                                                    )
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0'>
                                            <Calendar
                                                mode='single'
                                                selected={memberSince}
                                                onSelect={(day) =>
                                                    day && setMemberSince(day)
                                                }
                                                initialFocus
                                                disabled
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address */}
                    <Card className='mb-3 shadow-none overflow-hidden rounded-lg border-none'>
                        <CardContent className='p-2 bg-foreground'>
                            <div className='flex items-center mb-3 border-b'>
                                <Globe className='h-4 w-4 mr-2' />
                                <h3 className='text-lg font-medium'>Address</h3>
                                <Info className='h-4 w-4 ml-2 text-gray-400' />
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                                <div className='space-y-2 relative'>
                                    <Label htmlFor='street' className='flex'>
                                        Street{' '}
                                        <span className='text-red-500 ml-1'>
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id='street'
                                        placeholder='Enter street address'
                                        {...register('street')}
                                        onChange={(e) => {
                                            setValue('street', e.target.value);
                                            setStreetCharCount(
                                                640 - e.target.value.length,
                                            );
                                        }}
                                    />
                                    <div className='absolute right-3 top-9 bg-orange-500 text-white text-xs px-1 rounded'>
                                        {streetCharCount}
                                    </div>
                                    {errors.street && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.street.message}
                                        </p>
                                    )}
                                </div>

                                <div className='space-y-2 relative'>
                                    <Label htmlFor='city' className='flex'>
                                        City{' '}
                                        <span className='text-red-500 ml-1'>
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id='city'
                                        placeholder='Enter city'
                                        {...register('city')}
                                        onChange={(e) => {
                                            setValue('city', e.target.value);
                                            setCityCharCount(
                                                835 - e.target.value.length,
                                            );
                                        }}
                                    />
                                    <div className='absolute right-3 top-9 bg-orange-500 text-white text-xs px-1 rounded'>
                                        {cityCharCount}
                                    </div>
                                    {errors.city && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.city.message}
                                        </p>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='state' className='flex'>
                                        State{' '}
                                        <span className='text-red-500 ml-1'>
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        defaultValue={
                                            user?.personalData?.address
                                                ?.state || ''
                                        }
                                        onValueChange={(value) =>
                                            setValue('state', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select state' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='ca'>
                                                California
                                            </SelectItem>
                                            <SelectItem value='ny'>
                                                New York
                                            </SelectItem>
                                            <SelectItem value='tx'>
                                                Texas
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.state && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.state.message}
                                        </p>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='country' className='flex'>
                                        Country{' '}
                                        <span className='text-red-500 ml-1'>
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        defaultValue={
                                            user?.personalData?.address
                                                ?.country || ''
                                        }
                                        onValueChange={(value) =>
                                            setValue('country', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select country' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='us'>
                                                United States
                                            </SelectItem>
                                            <SelectItem value='ca'>
                                                Canada
                                            </SelectItem>
                                            <SelectItem value='uk'>
                                                United Kingdom
                                            </SelectItem>
                                            <SelectItem value='in'>
                                                India
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.country && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.country.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* About */}
                    <Card className='mb-3 shadow-none overflow-hidden rounded-lg border-none'>
                        <CardContent className='p-2 bg-foreground'>
                            <div className='flex items-center mb-3 border-b'>
                                <Info className='h-4 w-4 mr-2' />
                                <h3 className='text-lg font-medium'>About</h3>
                                <Info className='h-4 w-4 ml-2 text-gray-400' />
                            </div>

                            <div className='space-y-4'>
                                <div className='flex flex-wrap gap-2 border-b pb-2'>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        className='h-8'
                                    >
                                        <span className='font-bold'>B</span>
                                    </Button>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        className='h-8 italic'
                                    >
                                        <span>I</span>
                                    </Button>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        className='h-8 underline'
                                    >
                                        <span>U</span>
                                    </Button>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        className='h-8'
                                    >
                                        <span>S</span>
                                    </Button>
                                    <Separator
                                        orientation='vertical'
                                        className='h-8'
                                    />
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        className='h-8'
                                    >
                                        <span>1</span>
                                    </Button>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        className='h-8'
                                    >
                                        <span>•</span>
                                    </Button>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        className='h-8'
                                    >
                                        <span>≡</span>
                                    </Button>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        className='h-8'
                                    >
                                        <span>⟶</span>
                                    </Button>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        className='h-8'
                                    >
                                        <span>@</span>
                                    </Button>
                                </div>

                                <div className='relative'>
                                    <Textarea
                                        className='min-h-[150px] bg-background'
                                        placeholder='Write about yourself'
                                        {...register('about')}
                                        onChange={(e) => {
                                            setValue('about', e.target.value);
                                            setAboutCharCount(
                                                834 - e.target.value.length,
                                            );
                                        }}
                                    />
                                    <div className='absolute right-3 bottom-3 bg-orange-500 text-white text-xs px-1 rounded'>
                                        {aboutCharCount}
                                    </div>
                                    {errors.about && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.about.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Social Links */}
                    <Card className='mb-3 shadow-none overflow-hidden rounded-lg border-none'>
                        <CardContent className='p-2 bg-foreground'>
                            <div className='flex items-center mb-3 border-b'>
                                <ExternalLink className='h-4 w-4 mr-2' />
                                <h3 className='text-lg font-medium'>
                                    Social Links
                                </h3>
                                <Info className='h-4 w-4 ml-2 text-gray-400' />
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                                <div className='space-y-2'>
                                    <Label htmlFor='facebook'>Facebook</Label>
                                    <div className='flex items-center'>
                                        <Facebook className='h-5 w-5 mr-2 text-gray-500' />
                                        <Input
                                            id='facebook'
                                            placeholder='https://www.facebook.com'
                                            {...register('facebook')}
                                        />
                                    </div>
                                    {errors.facebook && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.facebook.message}
                                        </p>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='linkedin'>LinkedIn</Label>
                                    <div className='flex items-center'>
                                        <Linkedin className='h-5 w-5 mr-2 text-gray-500' />
                                        <Input
                                            id='linkedin'
                                            placeholder='https://www.linkedin.com'
                                            {...register('linkedin')}
                                        />
                                    </div>
                                    {errors.linkedin && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.linkedin.message}
                                        </p>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='instagram'>Instagram</Label>
                                    <div className='flex items-center'>
                                        <Instagram className='h-5 w-5 mr-2 text-gray-500' />
                                        <Input
                                            id='instagram'
                                            placeholder='https://www.instagram.com'
                                            {...register('instagram')}
                                        />
                                    </div>
                                    {errors.instagram && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.instagram.message}
                                        </p>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='x'>X.com</Label>
                                    <div className='flex items-center'>
                                        <svg
                                            className='h-5 w-5 mr-2 text-gray-500'
                                            viewBox='0 0 24 24'
                                            fill='currentColor'
                                        >
                                            <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                                        </svg>
                                        <Input
                                            id='x'
                                            placeholder='https://www.x.com'
                                            {...register('x')}
                                        />
                                    </div>
                                    {errors.x && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.x.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Others Links */}
                    <Card className='mb-3 shadow-none overflow-hidden rounded-lg border-none'>
                        <CardContent className='p-2 bg-foreground'>
                            <div className='flex items-center mb-3 border-b'>
                                <ExternalLink className='h-5 w-5 mr-2' />
                                <h3 className='text-lg font-medium'>
                                    Others Links
                                </h3>
                                <Info className='h-4 w-4 ml-2 text-gray-400' />
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div className='space-y-2'>
                                    <Label htmlFor='website'>
                                        Website Link
                                    </Label>
                                    <div className='flex items-center'>
                                        <Globe className='h-5 w-5 mr-2 text-gray-500' />
                                        <Input
                                            id='website'
                                            placeholder='https://www.johndoe.com'
                                            {...register('website')}
                                        />
                                    </div>
                                    {errors.website && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.website.message}
                                        </p>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='github'>GitHub</Label>
                                    <div className='flex items-center'>
                                        <Github className='h-5 w-5 mr-2 text-gray-500' />
                                        <Input
                                            id='github'
                                            placeholder='https://www.github.com'
                                            {...register('github')}
                                        />
                                    </div>
                                    {errors.github && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.github.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className='flex justify-center items-center mb-5 space-x-3'>
                        <Button
                            variant='outline'
                            type='button'
                            onClick={() => reset()}
                        >
                            <CircleX className='h-4 w-4 mr-2' />
                            Cancel
                        </Button>
                        <Button type='submit'>
                            <CircleCheckBig className='h-4 w-4 mr-2' />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
