'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Lock, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserProfileForm from './user-profile-form';
import PasswordChangeForm from './password-change-form';
import GlobalHeader from '@/components/global/GlobalHeader';

const MyProfileComponent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isProfile, setIsProfile] = useState(true);

    // Sync tab state with URL on mount and when searchParams change
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'change-password') {
            setIsProfile(false);
        } else {
            setIsProfile(true);
            // If no tab or invalid tab is specified, set default URL
            if (tab !== 'profile-settings') {
                router.push('/profile?tab=profile-settings', { scroll: false });
            }
        }
    }, [searchParams, router]);

    // Handle button clicks to update tab state and URL
    const handleTabChange = (isProfileTab: boolean) => {
        setIsProfile(isProfileTab);
        const tabValue = isProfileTab ? 'profile-settings' : 'change-password';
        router.push(`/profile?tab=${tabValue}`, { scroll: false });
    };

    return (
        <div className='pt-2'>
            <GlobalHeader
                subTitle='Manage your personal information and preferences'
                title='Profile Settings'
            />
            <div className='flex items-center justify-center gap-2 border-b w-fit mx-auto mt-3'>
                <Button
                    onClick={() => handleTabChange(true)}
                    variant='ghost'
                    className={cn(
                        'rounded-none',
                        isProfile === true &&
                            'text-primary border-b border-primary',
                    )}
                >
                    <UserRound />
                    Profile Settings
                </Button>
                <Button
                    onClick={() => handleTabChange(false)}
                    variant='ghost'
                    className={cn(
                        'rounded-none',
                        isProfile === false &&
                            'text-primary border-b border-primary',
                    )}
                >
                    <Lock />
                    Change Password
                </Button>
            </div>
            {isProfile ? <UserProfileForm /> : <PasswordChangeForm />}
        </div>
    );
};

export default MyProfileComponent;
