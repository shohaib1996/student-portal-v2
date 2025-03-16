'use client';
import React, { useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import {
    getMyNavigations,
    loadNotifications,
    getPrograms,
    getCourses,
    getServices,
    getCommunityPosts,
} from '../actions/initialActions';
import { connectSocket, disconnectSocket } from './socketManager';
import {
    logout,
    setEnrollment,
    setMyEnrollments,
    setUser,
} from '../redux/features/auth/authReducer';
import { setCompanyFeatures } from '../redux/features/comapnyReducer';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';
import { persistor, store } from '@/redux/store';

// Types
interface Storage {
    getItem: (key: string) => Promise<any>;
    setItem: (key: string, value: any) => Promise<void>;
}

interface Enrollment {
    _id: string;
    status: string;
    [key: string]: any;
}

interface User {
    [key: string]: any;
}

interface AuthWrapperProps {
    children: ReactNode;
}

const configureAxiosHeader = async (storage: Storage): Promise<void> => {
    axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
    const token = Cookies.get(
        process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME as string,
    );

    if (token) {
        axios.defaults.headers.common = {
            Authorization: token,
        };
    }

    const enroll = await storage.getItem('active_enrolment');
    const enrollId = enroll?._id;

    if (enrollId) {
        axios.defaults.headers.common['enrollment'] = enrollId;
    }
};

// Helper function to safely dispatch thunks
const dispatchSafely = <T extends unknown>(action: T) => {
    // This type assertion is needed to help TypeScript understand
    // that our action can be dispatched by the Redux store
    store.dispatch(action as any);
};

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [userData, setUserData] = useState<User>({});

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            const storageModule = await import('../utils/storage');
            const storage: Storage = storageModule.default;

            await configureAxiosHeader(storage);

            const token = Cookies.get(
                process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME as string,
            );

            // Safely dispatch thunk actions
            dispatchSafely(getPrograms());
            dispatchSafely(getCourses());
            dispatchSafely(getServices());

            const selectedOrganization = Cookies.get('activeCompany');

            if (token) {
                setIsLoading(true);
                try {
                    const res = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/user/verify`,
                        {
                            organization: selectedOrganization,
                        },
                    );

                    if (res.status === 200 && res.data.success) {
                        dispatchSafely(loadNotifications());
                        dispatchSafely(getMyNavigations());

                        setUserData(res.data.user);
                        setIsLoading(false);
                        dispatchSafely(setUser(res.data.user));

                        if (selectedOrganization) {
                            axios.defaults.headers.common['organization'] =
                                selectedOrganization;

                            dispatchSafely(
                                setCompanyFeatures(res.data.features || []),
                            );
                            await connectSocket();
                            dispatchSafely(
                                getCommunityPosts({
                                    limit: 10,
                                    activePage: 1,
                                    reset: false,
                                }),
                            );

                            dispatchSafely(
                                setMyEnrollments(res.data.enrollments),
                            );

                            const findActive: Enrollment | null =
                                await storage.getItem('active_enrolment');
                            const approved: Enrollment[] =
                                res.data.enrollments?.filter(
                                    (x: Enrollment) =>
                                        x?.status === 'approved' ||
                                        x?.status === 'trial',
                                );

                            // Extract the approved IDs for easier checks later
                            const approvedIds: string[] = approved?.map(
                                (x: Enrollment) => x?._id,
                            );

                            // 1. If approved.length is 0
                            if (!approved?.length) {
                                await storage.setItem('active_enrolment', {}); // setting in local storage as per previous point
                                return; // Exit here
                            }

                            // New condition: If approved.length is 1
                            if (approved?.length === 1 && !findActive?._id) {
                                await storage.setItem(
                                    'active_enrolment',
                                    approved[0],
                                );
                                // window.location.pathname = "/dashboard";
                                return; // Exit here
                            }

                            // 2. If approved.length > 0 and findActive is found and findActive belongs to approved
                            if (
                                findActive?._id &&
                                approvedIds?.includes(findActive._id)
                            ) {
                                const enrollment = approved?.find(
                                    (x: Enrollment) =>
                                        x._id === findActive?._id,
                                );
                                dispatchSafely(setEnrollment(enrollment));
                                return; // Exit here
                            }

                            // 3. If findActive doesn't belong to approved
                            if (
                                findActive?._id &&
                                !approvedIds?.includes(findActive._id)
                            ) {
                                await storage.setItem('active_enrolment', {});
                                // if (window.location.pathname !== "/enrollment-status") {
                                //     window.location.pathname = `/enrollment-status`;
                                // }
                                return; // Exit here
                            }

                            // 5. If there are multiple approved and no findActive is found
                            if (approved?.length > 0 && !findActive?._id) {
                                // if (window.location.pathname !== "/enrollment-status") {
                                //     window.location.pathname = "/enrollment-status";
                                // }
                                return;
                            }
                        }
                    }
                } catch (err: any) {
                    console.log(err);
                    setIsLoading(false);
                    Cookies.remove(
                        process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME as string,
                    );
                    toast.error(
                        err?.response?.data?.error || 'Something went wrong',
                    );
                    dispatchSafely(logout());
                    window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth/login`;
                }
            } else {
                setTimeout(async () => {
                    await persistor.pause();
                    await persistor.flush();
                    await persistor.purge();
                }, 200);

                window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth/login`;
            }
        };

        fetchData();

        return () => {
            disconnectSocket();
        };
    }, []);

    // Update loading spinner to use Tailwind instead of inline styles
    if (isLoading) {
        return (
            <div className='h-screen w-screen flex justify-center items-center'>
                <Loader className='animate-spin' />
            </div>
        );
    }

    // Pass userData as a prop to children using React.cloneElement
    return React.cloneElement(children as React.ReactElement);
};

export default AuthWrapper;
