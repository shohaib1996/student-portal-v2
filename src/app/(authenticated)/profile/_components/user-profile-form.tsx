'use client';

import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

// Shadcn Form Components
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

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
    Loader,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import Image from 'next/image';
import { DatePicker } from '@/components/global/DatePicket';
import dayjs from 'dayjs';
import { instance } from '@/lib/axios/axiosInstance';
import { setUser } from '@/redux/features/auth/authReducer';
import { useUpdateUserInfoMutation } from '@/redux/api/user/userApi';

// Form validation schema
const FormSchema = z.object({
    firstName: z
        .string()
        .min(2, { message: 'First name is required' })
        .refine((value) => value.trim().length > 0, {
            message: 'First name cannot be only spaces',
        }),
    lastName: z
        .string()
        .min(1, { message: 'Last name is required' })
        .refine((value) => value.trim().length > 0, {
            message: 'Last name cannot be only spaces',
        }),
    middleInitial: z.string().optional(),
    gender: z.string().min(1, { message: 'Gender is required' }),
    education: z.string().min(1, { message: 'Education is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    phone: z.string().min(10, { message: 'Valid phone number is required' }),
    street: z
        .string()
        .min(1, { message: 'Street is required' })
        .refine((value) => value.trim().length > 0, {
            message: 'Street cannot be only spaces',
        }),
    city: z
        .string()
        .min(1, { message: 'City is required' })
        .refine((value) => value.trim().length > 0, {
            message: 'City cannot be only spaces',
        }),
    state: z.string().min(1, { message: 'State is required' }),
    country: z.string().min(1, { message: 'Country is required' }),
    facebook: z
        .string()
        .url({ message: 'Invalid URL' })
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) {
                    return true;
                }
                return /^(https?:\/\/)?(www\.)?facebook\.com.*/.test(value);
            },
            { message: 'Invalid Facebook URL' },
        ),
    linkedin: z
        .string()
        .url({ message: 'Invalid URL' })
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) {
                    return true;
                }
                return /^(https?:\/\/)?(www\.)?linkedin\.com.*/.test(value);
            },
            { message: 'Invalid LinkedIn URL' },
        ),
    instagram: z
        .string()
        .url({ message: 'Invalid URL' })
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) {
                    return true;
                }
                return /^(https?:\/\/)?(www\.)?instagram\.com.*/.test(value);
            },
            { message: 'Invalid Instagram URL' },
        ),
    twitter: z
        .string()
        .url({ message: 'Invalid URL' })
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) {
                    return true;
                }
                return (
                    /^(https?:\/\/)?(www\.)?twitter\.com.*/.test(value) ||
                    /^(https?:\/\/)?(www\.)?x\.com.*/.test(value)
                );
            },
            { message: 'Invalid X/Twitter URL' },
        ),
    website: z
        .string()
        .url({ message: 'Invalid URL' })
        .optional()
        .or(z.literal('')),
    github: z
        .string()
        .url({ message: 'Invalid URL' })
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) {
                    return true;
                }
                return /^(https?:\/\/)?(www\.)?github\.com.*/.test(value);
            },
            { message: 'Invalid GitHub URL' },
        ),
    dateOfBirth: z.date(),
    about: z.string().min(10, {
        message: 'About section should have at least 10 characters',
    }),
});

export default function UserProfileForm() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [updateUserInfo, { isLoading: isUpdating }] =
        useUpdateUserInfoMutation();

    // Form state
    const [date, setDate] = useState(new Date(2000, 0, 1));
    const [memberSince, setMemberSince] = useState(
        user?.createdAt ? new Date(user.createdAt) : new Date(2010, 0, 12),
    );
    const [streetCharCount, setStreetCharCount] = useState(640);
    const [cityCharCount, setCityCharCount] = useState(835);
    const [aboutCharCount, setAboutCharCount] = useState(834);
    const [phoneNumber, setPhoneNumber] = useState<string>(
        typeof user?.phone === 'string' ? user.phone : '919876543210',
    );
    const [files, setFiles] = useState<File[]>([]);
    const [uploadFiles, setUploadFiles] = useState<string[]>([]);
    const [resumeFiledText, setResumeFiledText] = useState('Upload Resume');
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [uploadError, setUploadError] = useState(false);

    // Form setup
    const form = useForm({
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
            twitter:
                user?.personalData?.socialMedia?.twitter || 'https://www.x.com',
            website: user?.website || 'https://www.johndoe.com',
            github:
                user?.personalData?.socialMedia?.github ||
                'https://www.github.com',
            about:
                user?.about ||
                "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
        },
    });

    const resumeNameFormater = (url: string) => {
        return url?.split('/')?.pop()?.split('-')?.slice(1)?.join('-');
    };

    // Load user data when available
    useEffect(() => {
        if (user) {
            form.reset({
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
                twitter:
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

            setResumeFiledText(
                resumeNameFormater(user.personalData?.resume || '') ||
                    'Upload Resume',
            );
        }
    }, [user, form.reset]);

    const handleUpload = (sfiles: FileList | null) => {
        if (sfiles) {
            const fileList = Array.from(sfiles);
            const allowedExtensions = [
                'jpg',
                'jpeg',
                'png',
                'pdf',
                'doc',
                'docx',
            ];
            const filteredFiles = fileList.filter((file) => {
                const extension = file?.name?.split('.')?.pop()?.toLowerCase();
                if (!extension) {
                    return false;
                }
                return allowedExtensions.includes(extension);
            });
            filteredFiles.forEach((file) => {
                const exist = files.find((f) => file.name === f.name);
                if (!exist) {
                    setUploadingFiles(true);
                    setFiles((prev) => [...prev, file]);
                    const formData = new FormData();
                    formData.append('file', file);
                    instance
                        .post('/document/userdocumentfile', formData, {
                            headers: {
                                'Content-Type': 'multipart/formdata',
                            },
                        })
                        .then((res) => {
                            setUploadFiles((prev) => [res.data.fileUrl]);
                            setResumeFiledText(
                                resumeNameFormater(res.data.fileUrl) || '',
                            );
                            setUploadingFiles(false);
                            setUploadError(false);
                        })
                        .catch((err) => {
                            setUploadError(true);
                            setUploadingFiles(false);
                            console.log(err);
                        });
                }
            });
        }
    };

    // Handle date changes
    useEffect(() => {
        form.setValue('dateOfBirth', date);
    }, [date, form.setValue]);

    // Handle resume file selection
    interface ResumeChangeEvent extends React.ChangeEvent<HTMLInputElement> {
        target: HTMLInputElement & { files: FileList };
    }

    // Handle form submission
    const onSubmit = async (data: any) => {
        // Add the date and additional fields to the data
        const formData = {
            ...data,
            dateOfBirth: date.toISOString(),
            phone: phoneNumber,
            fullName: `${data.firstName} ${data.middleInitial ? data.middleInitial + ' ' : ''}${data.lastName}`,
            personalData: {
                resume: uploadFiles[0],
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

        try {
            const res = await instance.patch(`/user/updateuser`, formData);
            if (res?.data?.success) {
                dispatch(setUser(res?.data?.user));
                toast.success('Profile updated successfully');
            }
        } catch (err) {
            console.log(err);
        }
    };
    const commingSoon = () => {
        toast.success('Coming Soon...');
    };

    const uploadRef = useRef<HTMLInputElement>(null);

    return (
        <div className='max-w-[1200px] mx-auto'>
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
                <div className='flex items-center my-3 bg-foreground p-4 gap-2 rounded-lg'>
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
                            <span
                                className='text-blue-600 cursor-pointer hover:underline'
                                onClick={commingSoon}
                            >
                                Change Email
                            </span>
                        </p>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        {/* Personal Information */}
                        <Card className='mb-3 shadow-none rounded-lg border-none'>
                            <CardContent className='md:p-4 p-2 bg-foreground'>
                                <div className='flex items-center mb-3 border-b'>
                                    <UserRound className='h-4 w-4 mr-2' />
                                    <h3 className='text-lg font-medium'>
                                        Personal Information
                                    </h3>
                                    <Info className='h-4 w-4 ml-2 text-gray-400' />
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                                    <FormField
                                        control={form.control}
                                        name='firstName'
                                        render={({ field }) => (
                                            <FormItem className=''>
                                                <FormLabel className='flex'>
                                                    First Name{' '}
                                                    <span className='text-red-500 ml-1'>
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder='Enter first name'
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='middleInitial'
                                        render={({ field }) => (
                                            <FormItem className=''>
                                                <FormLabel className='flex'>
                                                    Middle Initial{' '}
                                                    <span className='md:hidden lg:block'>
                                                        (Optional)
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder='Enter middle name'
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='lastName'
                                        render={({ field }) => (
                                            <FormItem className=''>
                                                <FormLabel className='flex'>
                                                    Last Name{' '}
                                                    <span className='text-red-500 ml-1'>
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder='Enter last name'
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className='space-y-2'>
                                        <Label htmlFor='dob' className='flex'>
                                            Date of Birth{' '}
                                            <span className='text-red-500 ml-1'>
                                                *
                                            </span>
                                        </Label>
                                        <DatePicker
                                            className='bg-background'
                                            yearSelection
                                            value={dayjs(date)}
                                            onChange={(day) =>
                                                day && setDate(day.toDate())
                                            }
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name='gender'
                                        render={({ field }) => (
                                            <FormItem className=''>
                                                <FormLabel className='flex'>
                                                    Gender{' '}
                                                    <span className='text-red-500 ml-1'>
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <Select
                                                    defaultValue={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select gender' />
                                                        </SelectTrigger>
                                                    </FormControl>
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
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='education'
                                        render={({ field }) => (
                                            <FormItem className=''>
                                                <FormLabel className='flex'>
                                                    Education{' '}
                                                    <span className='text-red-500 ml-1'>
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <Select
                                                    defaultValue={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select education' />
                                                        </SelectTrigger>
                                                    </FormControl>
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
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='email'
                                        render={({ field }) => (
                                            <FormItem className=''>
                                                <FormLabel className='flex'>
                                                    Email Address{' '}
                                                    <span className='text-red-500 ml-1'>
                                                        *
                                                    </span>{' '}
                                                    <span className='text-red-500 ml-1 text-xs md:hidden lg:block'>
                                                        (Not Verified)
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder='Enter email'
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='phone'
                                        render={({ field }) => (
                                            <FormItem className=''>
                                                <FormLabel className='flex'>
                                                    Phone Number{' '}
                                                    <span className='text-red-500 ml-1'>
                                                        *
                                                    </span>{' '}
                                                    <span className='text-green-500 ml-1 text-xs md:hidden lg:block'>
                                                        (Verified)
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <div className='relative'>
                                                        <PhoneInput
                                                            country={'us'}
                                                            value={
                                                                phoneNumber as string
                                                            }
                                                            onChange={(
                                                                phone,
                                                            ) => {
                                                                setPhoneNumber(
                                                                    phone,
                                                                );
                                                                form.setValue(
                                                                    'phone',
                                                                    phone,
                                                                );
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
                                                                background:
                                                                    'transparent',
                                                            }}
                                                        />
                                                        <div className='absolute right-3 top-1/2 transform -translate-y-1/2 z-10'>
                                                            <Check className='h-5 w-5 text-green-500' />
                                                        </div>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className='space-y-2'>
                                        <Label
                                            htmlFor='resume'
                                            className='flex'
                                        >
                                            Resume{' '}
                                            <span className='text-red-500 ml-1'>
                                                *
                                            </span>
                                        </Label>
                                        <div className='border bg-background h-10 rounded-md p-2 relative'>
                                            <input
                                                disabled={uploadingFiles}
                                                type='file'
                                                id='resume'
                                                className='opacity-0 absolute inset-0 w-full cursor-pointer'
                                                onChange={(e) =>
                                                    handleUpload(e.target.files)
                                                }
                                                accept='.pdf,.doc,.docx'
                                            />
                                            <div className='flex items-center'>
                                                <div className=' p-0 rounded mr-2'>
                                                    <FileText className='h-5 w-5 text-dark-gray' />
                                                </div>
                                                <div className='flex-1 truncate'>
                                                    <span className='text-sm'>
                                                        {resumeFiledText ||
                                                            'Click to upload resume'}
                                                    </span>
                                                </div>
                                                <div
                                                    className={`ml-2 ${uploadError ? 'text-red-500' : ''}`}
                                                >
                                                    {uploadingFiles ? (
                                                        <Loader
                                                            size={18}
                                                            className='animate-spin'
                                                        />
                                                    ) : uploadError ? (
                                                        <X className='h-5 w-5' />
                                                    ) : resumeFiledText ? (
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
                                                        day &&
                                                        setMemberSince(day)
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
                            <CardContent className='md:p-4 p-2 bg-foreground'>
                                <div className='flex items-center mb-3 border-b'>
                                    <Globe className='h-4 w-4 mr-2' />
                                    <h3 className='text-lg font-medium'>
                                        Address
                                    </h3>
                                    <Info className='h-4 w-4 ml-2 text-gray-400' />
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                                    <FormField
                                        control={form.control}
                                        name='street'
                                        render={({ field }) => (
                                            <FormItem className=' relative'>
                                                <FormLabel className='flex'>
                                                    Street{' '}
                                                    <span className='text-red-500 ml-1'>
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder='Enter street address'
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            setStreetCharCount(
                                                                640 -
                                                                    e.target
                                                                        .value
                                                                        .length,
                                                            );
                                                        }}
                                                    />
                                                </FormControl>
                                                <div className='absolute right-3 top-9 bg-orange-500 text-white text-xs px-1 rounded'>
                                                    {streetCharCount}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='city'
                                        render={({ field }) => (
                                            <FormItem className=' relative'>
                                                <FormLabel className='flex'>
                                                    City{' '}
                                                    <span className='text-red-500 ml-1'>
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder='Enter city'
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            setCityCharCount(
                                                                835 -
                                                                    e.target
                                                                        .value
                                                                        .length,
                                                            );
                                                        }}
                                                    />
                                                </FormControl>
                                                <div className='absolute right-3 top-9 bg-orange-500 text-white text-xs px-1 rounded'>
                                                    {cityCharCount}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='state'
                                        render={({ field }) => (
                                            <FormItem className=''>
                                                <FormLabel className='flex'>
                                                    State{' '}
                                                    <span className='text-red-500 ml-1'>
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <Select
                                                    defaultValue={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select state' />
                                                        </SelectTrigger>
                                                    </FormControl>
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
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='country'
                                        render={({ field }) => (
                                            <FormItem className=''>
                                                <FormLabel className='flex'>
                                                    Country{' '}
                                                    <span className='text-red-500 ml-1'>
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <Select
                                                    defaultValue={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select country' />
                                                        </SelectTrigger>
                                                    </FormControl>
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
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* About */}
                        <Card className='mb-3 shadow-none overflow-hidden rounded-lg border-none'>
                            <CardContent className='p-2 md:p-4 bg-foreground'>
                                <div className='flex items-center mb-3 border-b'>
                                    <Info className='h-4 w-4 mr-2' />
                                    <h3 className='text-lg font-medium'>
                                        About
                                    </h3>
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

                                    <FormField
                                        control={form.control}
                                        name='about'
                                        render={({ field }) => (
                                            <FormItem className='relative'>
                                                <FormControl>
                                                    <Textarea
                                                        className='min-h-[150px] bg-background'
                                                        placeholder='Write about yourself'
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            setAboutCharCount(
                                                                834 -
                                                                    e.target
                                                                        .value
                                                                        .length,
                                                            );
                                                        }}
                                                    />
                                                </FormControl>
                                                <div className='absolute right-3 bottom-3 bg-orange-500 text-white text-xs px-1 rounded'>
                                                    {aboutCharCount}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social Links */}
                        <Card className='mb-3 shadow-none overflow-hidden rounded-lg border-none'>
                            <CardContent className='md:p-4 p-2 bg-foreground'>
                                <div className='flex items-center mb-3 border-b'>
                                    <ExternalLink className='h-4 w-4 mr-2' />
                                    <h3 className='text-lg font-medium'>
                                        Social Links
                                    </h3>
                                    <Info className='h-4 w-4 ml-2 text-gray-400' />
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                                    <FormField
                                        control={form.control}
                                        name='facebook'
                                        render={({ field }) => (
                                            <FormItem className=''>
                                                <FormLabel>Facebook</FormLabel>
                                                <FormControl>
                                                    <div className='flex items-center'>
                                                        <Facebook className='h-5 w-5 mr-2 text-gray-500' />
                                                        <Input
                                                            placeholder='https://www.facebook.com'
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='linkedin'
                                        render={({ field }) => (
                                            <FormItem className='space-y-2'>
                                                <FormLabel>LinkedIn</FormLabel>
                                                <FormControl>
                                                    <div className='flex items-center'>
                                                        <Linkedin className='h-5 w-5 mr-2 text-gray-500' />
                                                        <Input
                                                            placeholder='https://www.linkedin.com'
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='instagram'
                                        render={({ field }) => (
                                            <FormItem className='space-y-2'>
                                                <FormLabel>Instagram</FormLabel>
                                                <FormControl>
                                                    <div className='flex items-center'>
                                                        <Instagram className='h-5 w-5 mr-2 text-gray-500' />
                                                        <Input
                                                            placeholder='https://www.instagram.com'
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='twitter'
                                        render={({ field }) => (
                                            <FormItem className='space-y-2'>
                                                <FormLabel>X.com</FormLabel>
                                                <FormControl>
                                                    <div className='flex items-center'>
                                                        <svg
                                                            className='h-5 w-5 mr-2 text-gray-500'
                                                            viewBox='0 0 24 24'
                                                            fill='currentColor'
                                                        >
                                                            <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                                                        </svg>
                                                        <Input
                                                            placeholder='https://www.x.com'
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Others Links */}
                        <Card className='mb-3 shadow-none overflow-hidden rounded-lg border-none'>
                            <CardContent className='p-2 md:p-4 bg-foreground'>
                                <div className='flex items-center mb-3 border-b'>
                                    <ExternalLink className='h-5 w-5 mr-2' />
                                    <h3 className='text-lg font-medium'>
                                        Others Links
                                    </h3>
                                    <Info className='h-4 w-4 ml-2 text-gray-400' />
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <FormField
                                        control={form.control}
                                        name='website'
                                        render={({ field }) => (
                                            <FormItem className='space-y-2'>
                                                <FormLabel>
                                                    Website Link
                                                </FormLabel>
                                                <FormControl>
                                                    <div className='flex items-center'>
                                                        <Globe className='h-5 w-5 mr-2 text-gray-500' />
                                                        <Input
                                                            placeholder='https://www.johndoe.com'
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='github'
                                        render={({ field }) => (
                                            <FormItem className='space-y-2'>
                                                <FormLabel>GitHub</FormLabel>
                                                <FormControl>
                                                    <div className='flex items-center'>
                                                        <Github className='h-5 w-5 mr-2 text-gray-500' />
                                                        <Input
                                                            placeholder='https://www.github.com'
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className='flex justify-center items-center mb-5 space-x-3'>
                            <Button
                                variant='outline'
                                type='button'
                                onClick={() => form.reset()}
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
                </Form>
            </div>
        </div>
    );
}
