'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserProfileForm from './user-profile-form';
import PasswordChangeForm from './password-change-form';
import GlobalHeader from '@/components/global/GlobalHeader';

const MyProfileComponent = () => {
    const [isProfile, setIsProfile] = useState<boolean>(true);

    return (
        <div className='pt-2'>
            {/* <h2 className='text-center font-semibold text-xl mb-3'>
                Profile Settings
            </h2> */}
            <GlobalHeader
                subTitle='Manage your personal information and preferences'
                title='Profile Settings'
            />
            <div className='flex items-cente justify-center gap-2 border-b w-fit mx-auto mt-3'>
                <Button
                    onClick={() => setIsProfile(true)}
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
                    onClick={() => setIsProfile(false)}
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
            {isProfile ? (
                <UserProfileForm />
            ) : (
                <PasswordChangeForm
                // username='John Doe'
                // date={new Date(2024, 1, 12)}
                // onCancel={() => console.log('Cancelled')}
                // onSubmit={async (currentPassword, newPassword) => {}}
                />
            )}
        </div>
    );
};

export default MyProfileComponent;
