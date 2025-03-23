'use client';

import { useState } from 'react';
import PortalForm from '@/components/global/Form/PortalForm';
import { Button } from '@/components/ui/button';
import { LockKeyhole, Mail, Eye, EyeOff, Loader } from 'lucide-react';
import Link from 'next/link';
import { useLoginUserMutation } from '@/redux/api/auth/authApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import PortalInput from '@/components/global/Form/Inputs/PortalInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Cookies from 'js-cookie';

const logo1 = '/logo.png';

interface LoginFormValues {
    email: string;
    password: string;
}

const LoginPageCom = () => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loginUser, { isLoading, isError, error }] = useLoginUserMutation();
    const router = useRouter();

    const schema = z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
    });

    const defaultData = {
        email: '186mdshimul@gmail.com',
        password: 'Ashraful186@@',
    };

    const handleLogin = async (data: LoginFormValues) => {
        const logInfo = {
            email: data.email,
            password: data.password,
        };
        try {
            const response = await loginUser(logInfo).unwrap();

            console.log({ response });

            if (response?.isVerified && response?.success) {
                Cookies.set(
                    process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME as string,
                    `Bearer ${response?.token}`,
                );

                router.push(`/dashboard`);
            } else {
                toast.error('You are not valid user');
            }
        } catch (err: any) {
            console.error('Login failed:', err);
            toast.error(err.data.error);
        }
    };

    return (
        <div className='mx-auto flex min-h-screen max-w-screen-2xl items-center justify-center bg-background'>
            <div className='flex min-h-screen w-1/2 flex-col justify-center rounded-lg bg-background p-8 shadow-lg'>
                <h2 className='mb-4 text-center text-3xl font-semibold text-black'>
                    Welcome back!
                </h2>

                <PortalForm
                    onSubmit={handleLogin}
                    resolver={zodResolver(schema)}
                    defaultValues={defaultData}
                >
                    <PortalInput
                        placeholder='Email'
                        ngClass='bg-foreground'
                        name='email'
                        label='Email'
                        required={true}
                        leftIcon={<Mail size={18} className='text-gray' />}
                    />
                    <PortalInput
                        placeholder='Password'
                        ngClass='bg-foreground'
                        type={!showPassword ? 'password' : 'text'}
                        name='password'
                        required={true}
                        label='Password'
                        passwordShowingFunction={() =>
                            setShowPassword(!showPassword)
                        }
                        rightIcon={
                            showPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )
                        }
                        leftIcon={<LockKeyhole size={18} />}
                    />

                    {/* Sign In Button */}
                    <Button
                        className='mt-common'
                        type='submit'
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className='flex items-center gap-2'>
                                <Loader className='animate-spin' size={20} />{' '}
                                Signing In...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </Button>

                    {/* Forgot Password */}
                    <div className='mt-common text-center'>
                        <Link
                            href='/forgot-password'
                            className='text-sm text-primary hover:underline'
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <div className='text-center text-sm text-gray'>
                        Or Sign In With
                    </div>
                    <div className='mt-common flex items-center justify-center gap-common'></div>
                    <div className='text-center text-gray'>
                        Don’t have an account? &nbsp;
                        <Link
                            className='font- text-lg text-primary'
                            href='/auth/register'
                        >
                            Register
                        </Link>
                    </div>
                    <p className='mt-common flex flex-col text-center text-gray'>
                        By Clicking “Sign In”, you agree to our{' '}
                        <Link href='#' className='text-primary'>
                            Terms of Use and Privacy Policy.
                        </Link>
                    </p>
                </PortalForm>
            </div>
            <div className='flex min-h-screen w-1/2 flex-col items-center justify-center bg-primary text-center'>
                <Image
                    alt='bootcampsHub logo'
                    className='w-64'
                    src={logo1}
                    height={80}
                    width={200}
                />
                <h3 className='mt-common text-4xl font-bold text-pure-white'>
                    Welcome Back!
                </h3>
                <p className='mx-36 mt-common self-center text-center font-semibold text-pure-white'>
                    to keep connection with use please login with your personal
                    info
                </p>
                <Link
                    href='/auth/register'
                    className='mt-common rounded-md bg-pure-white px-5 py-2 font-medium text-primary'
                >
                    Register
                </Link>
            </div>
        </div>
    );
};

export default LoginPageCom;
