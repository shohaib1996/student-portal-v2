'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { store } from '@/redux/store';
import CookiesHandler from '@/lib/axios/CookiesHandler';
import { setMyEnrollments, setUser } from '@/redux/features/auth/authReducer';
import { useVerifyUserMutation } from '@/redux/api/auth/authApi';

const WithAuth = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const router = useRouter();
    const [verifyUser] = useVerifyUserMutation();

    useEffect(() => {
        const authenticateUser = async () => {
            try {
                const token = await CookiesHandler(
                    'get',
                    process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME as string,
                );

                if (!token) {
                    router.push('/auth/login');
                    return;
                }

                const res = await verifyUser({});

                if (!res?.data?.success) {
                    setIsLoading(false);
                    throw new Error('Unauthorized');
                }

                const enrollment = await CookiesHandler('get', 'enrollment');
                store.dispatch(setUser(res.data.user));
                store.dispatch(setMyEnrollments(res.data.enrollments));

                if (!enrollment?.value && res.data?.enrollments[0]?._id) {
                    await CookiesHandler(
                        'add',
                        'enrollment',
                        res.data.enrollments[0]._id,
                    );
                }

                setIsLoading(false);
            } catch (err) {
                console.error(err);
            }
        };

        authenticateUser();
    }, [verifyUser, router]);

    // useEffect(() => {
    //   if (isLoading) {
    //     let progressValue = 0;
    //     const interval = setInterval(() => {
    //       progressValue += 5;
    //       if (progressValue >= 100) {
    //         clearInterval(interval);
    //       }
    //       setProgress(progressValue);
    //     }, 600);
    //     return () => clearInterval(interval);
    //   }
    // }, [isLoading]);

    // return isLoading ? <Preloader progress={progress} /> : <>{children}</>;
    return <>{!isLoading && children}</>;
};

export default WithAuth;
