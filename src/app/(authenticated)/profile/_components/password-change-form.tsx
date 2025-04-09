import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAppSelector } from '@/redux/hooks';
import { instance } from '@/lib/axios/axiosInstance';

// Zod schema for password validation
const passwordSchema = z
    .object({
        currentPass: z.string().min(1, 'Please enter your current password'),
        newPass: z.string().min(8, 'Password should be minimum 8 characters'),
        confirmPass: z.string(),
    })
    .refine((data) => data.newPass === data.confirmPass, {
        message: "Password doesn't match",
        path: ['confirmPass'],
    });

const ChangePassword = () => {
    const [submitting, setSubmitting] = useState(false);
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const { user } = useAppSelector((s) => s.auth);

    // Initialize form with react-hook-form and zod resolver
    const form = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPass: '',
            newPass: '',
            confirmPass: '',
        },
    });

    // Handle form submission
    const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
        const data = {
            currentPassword: values.currentPass,
            newPassword: values.newPass,
            confirmPassword: values.confirmPass,
        };

        setSubmitting(true);
        try {
            const res = await instance.patch('/user/changepassword', data);

            toast.success(res.data.message);

            // Reset form after successful submission
            form.reset();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className='bg-foreground max-w-[1200px] rounded-lg mt-3 mx-auto'>
                <div className='p-4'>
                    <div className='flex justify-center flex-col gap-4 items-center'>
                        <h2 className='font-semibold text-lg text-black title'>
                            Change Your Password
                        </h2>
                        <p className='text-gray font-14 text-center'>
                            {user?.fullName} Changed his Password on{' '}
                            {user?.updatedAt
                                ? format(
                                      new Date(user.updatedAt),
                                      'MMMM dd, yyyy',
                                  )
                                : 'N/A'}
                        </p>

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className='change-pass-form w-full max-w-lg space-y-4'
                            >
                                <FormField
                                    control={form.control}
                                    name='currentPass'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Current Password
                                            </FormLabel>
                                            <div className='relative'>
                                                <FormControl>
                                                    <Input
                                                        type={
                                                            showCurrentPass
                                                                ? 'text'
                                                                : 'password'
                                                        }
                                                        placeholder='Enter current password'
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <button
                                                    type='button'
                                                    onClick={() =>
                                                        setShowCurrentPass(
                                                            !showCurrentPass,
                                                        )
                                                    }
                                                    className='absolute right-3 top-1/2 -translate-y-1/2'
                                                >
                                                    {showCurrentPass ? (
                                                        <EyeOff size={20} />
                                                    ) : (
                                                        <Eye size={20} />
                                                    )}
                                                </button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='newPass'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <div className='relative'>
                                                <FormControl>
                                                    <Input
                                                        type={
                                                            showNewPass
                                                                ? 'text'
                                                                : 'password'
                                                        }
                                                        placeholder='Enter new password'
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <button
                                                    type='button'
                                                    onClick={() =>
                                                        setShowNewPass(
                                                            !showNewPass,
                                                        )
                                                    }
                                                    className='absolute right-3 top-1/2 -translate-y-1/2'
                                                >
                                                    {showNewPass ? (
                                                        <EyeOff size={20} />
                                                    ) : (
                                                        <Eye size={20} />
                                                    )}
                                                </button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='confirmPass'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Confirm Password
                                            </FormLabel>
                                            <div className='relative'>
                                                <FormControl>
                                                    <Input
                                                        type={
                                                            showConfirmPass
                                                                ? 'text'
                                                                : 'password'
                                                        }
                                                        placeholder='Confirm new password'
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <button
                                                    type='button'
                                                    onClick={() =>
                                                        setShowConfirmPass(
                                                            !showConfirmPass,
                                                        )
                                                    }
                                                    className='absolute right-3 top-1/2 -translate-y-1/2'
                                                >
                                                    {showConfirmPass ? (
                                                        <EyeOff size={20} />
                                                    ) : (
                                                        <Eye size={20} />
                                                    )}
                                                </button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className='flex justify-between space-x-4 pt-4'>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        onClick={() => form.reset()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type='submit' disabled={submitting}>
                                        {submitting
                                            ? 'Submitting...'
                                            : 'Submit'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChangePassword;
