'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Check, CircleX, CircleCheckBig } from 'lucide-react';
import PasswordInput from './password-input';
import { useAppSelector } from '@/redux/hooks';
import dayjs from 'dayjs';

interface PasswordChangeFormProps {
    username: string;
    date: Date;
    onCancel: () => void;
    onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
}

export default function PasswordChangeForm({
    username = 'John Doe',
    date = new Date(2024, 1, 12), // February 12, 2024
    onCancel = () => {},
    onSubmit = async () => {},
}: PasswordChangeFormProps) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAppSelector((state) => state.auth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!currentPassword) {
            alert('Please enter your current password');
            return;
        }

        if (!newPassword) {
            alert('Please enter a new password');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('New password and confirm password do not match');
            return;
        }

        try {
            setIsSubmitting(true);
            await onSubmit(currentPassword, newPassword);
        } catch (error) {
            console.error('Error changing password:', error);
            alert('Failed to change password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className='max-w-4xl mx-auto mb-3 shadow-none overflow-hidden border-none'>
            <CardHeader className='p-2'>
                <CardTitle className='text-center text-lg font-medium'>
                    {user?.fullName} Changed his Password on{' '}
                    {dayjs(user?.updatedAt).format('MMMM DD, YYYY')}
                </CardTitle>
            </CardHeader>
            <CardContent className='p-2'>
                <form onSubmit={handleSubmit} className='space-y-5'>
                    <PasswordInput
                        id='current-password'
                        label='Current Password'
                        tooltipText='Enter your current password'
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        placeholder='Enter current password'
                        required
                    />

                    <PasswordInput
                        id='new-password'
                        label='New Password'
                        tooltipText='Password must be at least 8 characters'
                        value={newPassword}
                        onChange={setNewPassword}
                        placeholder='Enter new password'
                        required
                    />

                    <PasswordInput
                        id='confirm-password'
                        label='Confirm Password'
                        tooltipText='Re-enter your new password'
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        placeholder='Enter confirm password'
                        required
                    />

                    <div className='flex justify-center gap-4'>
                        <Button variant='outline'>
                            <CircleX className='h-4 w-4' />
                            Cancel
                        </Button>
                        <Button>
                            <CircleCheckBig className='h-4 w-4' />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
