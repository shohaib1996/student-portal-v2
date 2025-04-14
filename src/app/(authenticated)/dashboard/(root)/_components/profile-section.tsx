'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useGetAllPortalChartDataMutation } from '@/redux/api/myprogram/myprogramApi';
import { useAppSelector } from '@/redux/hooks';

// Define types for user data
interface Address {
    country?: string;
    city?: string;
    street?: string;
    postalCode?: string;
    state?: string;
}

interface SocialMedia {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
}

interface PersonalData {
    address?: Address;
    socialMedia?: SocialMedia;
    resume?: string;
    bio?: string;
}

interface ProfileStatus {
    recurring?: {
        isDailyRecurring?: boolean;
        fromTime?: string;
        toTime?: string;
    };
    currentStatus?: string;
}

interface User {
    _id?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    gender?: string;
    about?: string;
    personalData?: PersonalData;
    profilePicture?: string;
    updatedAt?: string;
    lastPasswordChange?: string;
    profileStatus?: ProfileStatus;
    [key: string]: any; // For other properties we might access
}

// Define types for API response
interface PortalDataResults {
    lastPasswordUpdate?: {
        success: boolean;
        results: {
            lastPasswordUpdate: string;
        };
    };
    [key: string]: any;
}

interface PortalData {
    success?: boolean;
    data?: PortalDataResults;
}

export function ProfileSection() {
    const [getAllPortalChartData, { data: portalData, isLoading }] =
        useGetAllPortalChartDataMutation();
    const [lastPasswordUpdate, setLastPasswordUpdate] = useState<string | null>(
        null,
    );
    const { user } = useAppSelector((state) => state.auth);
    const [profileCompletion, setProfileCompletion] = useState<number>(0);
    const [lastProfileUpdate, setLastProfileUpdate] = useState<string>('');

    // Type-safe user access
    const typedUser = user as User | undefined;

    useEffect(() => {
        // Call the API with the required payload
        getAllPortalChartData({
            community: {},
            lastPasswordUpdate: {},
            template: {},
            review: {},
            familyMember: {},
        });
    }, [getAllPortalChartData]);

    useEffect(() => {
        // Update the lastPasswordUpdate state when data is received
        if (portalData?.data?.lastPasswordUpdate?.success) {
            setLastPasswordUpdate(
                portalData.data.lastPasswordUpdate.results.lastPasswordUpdate,
            );
        }
    }, [portalData]);

    useEffect(() => {
        if (typedUser) {
            // Calculate profile completion percentage
            calculateProfileCompletion();

            // Set last profile update time based on user's updatedAt
            if (typedUser.updatedAt) {
                setLastProfileUpdate(formatDate(typedUser.updatedAt));
            }
        }
    }, [typedUser]);

    // Calculate profile completion percentage based on filled user fields
    const calculateProfileCompletion = () => {
        if (!typedUser) {
            return;
        }

        let totalFields = 0;
        let completedFields = 0;

        // Basic info checks
        const basicInfoFields: Array<keyof User> = [
            'firstName',
            'lastName',
            'email',
            'phone',
            'gender',
            'about',
        ];
        totalFields += basicInfoFields.length;
        basicInfoFields.forEach((field) => {
            if (typedUser[field] && String(typedUser[field]).trim()) {
                completedFields++;
            }
        });

        // Address checks
        if (typedUser.personalData && typedUser.personalData.address) {
            const addressFields: Array<keyof Address> = [
                'country',
                'city',
                'street',
                'postalCode',
                'state',
            ];
            totalFields += addressFields.length;
            addressFields.forEach((field) => {
                if (
                    typedUser.personalData?.address &&
                    typedUser.personalData.address[field] &&
                    String(typedUser.personalData.address[field]).trim()
                ) {
                    completedFields++;
                }
            });
        }

        // Social media checks
        if (typedUser.personalData && typedUser.personalData.socialMedia) {
            const socialFields: Array<keyof SocialMedia> = [
                'facebook',
                'twitter',
                'linkedin',
                'instagram',
                'github',
            ];
            totalFields += socialFields.length;
            socialFields.forEach((field) => {
                if (
                    typedUser.personalData?.socialMedia &&
                    typedUser.personalData.socialMedia[field] &&
                    String(typedUser.personalData.socialMedia[field]).trim()
                ) {
                    completedFields++;
                }
            });
        }

        // Profile picture check
        totalFields += 1;
        if (typedUser.profilePicture) {
            completedFields += 1;
        }

        // Bio check
        totalFields += 1;
        if (typedUser.personalData?.bio && typedUser.personalData.bio.trim()) {
            completedFields += 1;
        }

        // Resume check
        totalFields += 1;
        if (
            typedUser.personalData?.resume &&
            typedUser.personalData.resume.trim()
        ) {
            completedFields += 1;
        }

        const completion = Math.round((completedFields / totalFields) * 100);
        setProfileCompletion(completion);
    };

    // Function to format the date
    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) {
            return 'Never updated';
        }

        const date = new Date(dateString);
        const now = new Date();

        // Calculate the difference in days
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 1) {
            return 'Today';
        }
        if (diffDays === 1) {
            return 'Yesterday';
        }
        if (diffDays < 7) {
            return `${diffDays} days ago`;
        }
        if (diffDays < 14) {
            return '1 week ago';
        }
        if (diffDays < 30) {
            return `${Math.floor(diffDays / 7)} weeks ago`;
        }
        if (diffDays < 60) {
            return '1 month ago';
        }

        return `${Math.floor(diffDays / 30)} months ago`;
    };

    // Safely get the user's name with proper fallback
    const getUserName = (): string => {
        if (!typedUser) {
            return 'My Profile';
        }

        const firstName = typedUser.firstName ? typedUser.firstName.trim() : '';
        const lastName = typedUser.lastName ? typedUser.lastName.trim() : '';

        if (!firstName && !lastName) {
            return 'My Profile';
        }
        return `${firstName} ${lastName}`.trim();
    };

    return (
        <Card className='p-2 rounded-lg shadow-none bg-foreground'>
            <CardHeader className='p-2 border-b'>
                <CardTitle className='text-md font-medium'>Profile</CardTitle>
                <span className='text-xs text-muted-foreground'>
                    View Profile Information
                </span>
            </CardHeader>
            <CardContent className='p-2'>
                <div className='grid grid-cols-1 gap-4'>
                    <div className='border rounded-lg p-3 bg-background'>
                        <div className='flex items-center gap-2 mb-2'>
                            <div className=' rounded-md bg-primary/10 text-primary flex items-center justify-center'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='16'
                                    height='16'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className='lucide lucide-user'
                                >
                                    <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
                                    <circle cx='12' cy='7' r='4' />
                                </svg>
                            </div>
                            <div className='flex items-center justify-center gap-2'>
                                <h4 className='text-sm font-medium'>
                                    {getUserName()}
                                </h4>
                                <div className='flex items-center text-xs text-muted-foreground'>
                                    <span className='text-black text-xs rounded-full bg-background'>
                                        {isLoading
                                            ? 'Loading...'
                                            : `${profileCompletion}% complete`}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Progress value={profileCompletion} className='h-2' />
                        <p className='text-xs my-3'>
                            Last updated {lastProfileUpdate || 'Loading...'}
                        </p>
                        <Link href='/profile' className='w-full'>
                            <Button
                                variant='secondary'
                                size='sm'
                                className='w-full text-xs'
                            >
                                {profileCompletion < 100
                                    ? 'Complete Profile'
                                    : 'View Profile'}
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='12'
                                    height='12'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className='lucide lucide-arrow-right ml-1'
                                >
                                    <path d='M5 12h14' />
                                    <path d='m12 5 7 7-7 7' />
                                </svg>
                            </Button>
                        </Link>
                    </div>

                    <div className='border rounded-lg p-3 bg-background flex flex-col justify-between'>
                        <div className='flex items-center gap-2 mb-2'>
                            <div className='w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='16'
                                    height='16'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className='lucide lucide-key'
                                >
                                    <path d='m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4' />
                                </svg>
                            </div>
                            <div>
                                <h4 className='font-medium text-sm'>
                                    Change Password
                                </h4>
                            </div>
                        </div>
                        <div className='text-xs text-muted-foreground mt-2 mb-4'>
                            <div className='flex items-center gap-1 mt-1'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='12'
                                    height='12'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className='lucide lucide-clock'
                                >
                                    <circle cx='12' cy='12' r='10' />
                                    <polyline points='12 6 12 12 16 14' />
                                </svg>
                                Last updated{' '}
                                {isLoading
                                    ? 'Loading...'
                                    : formatDate(
                                          typedUser?.lastPasswordChange ||
                                              lastPasswordUpdate,
                                      )}
                            </div>
                        </div>
                        <Link href={'/profile'}>
                            <Button
                                variant='secondary'
                                size='sm'
                                className='w-full text-xs'
                            >
                                Change Now
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='12'
                                    height='12'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className='lucide lucide-arrow-right ml-1'
                                >
                                    <path d='M5 12h14' />
                                    <path d='m12 5 7 7-7 7' />
                                </svg>
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
