'use client';
import React, { useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import {
    getMyNavigations,
    loadNotifications,
    getCommunityPosts,
    loadChats,
    getOnlines,
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
import { AppDispatch, persistor, store } from '@/redux/store';
import { useDispatch } from 'react-redux'; // Add this import
import CombinedSelectionModal from '@/components/global/SelectModal/combined-selection-modal';

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

    const activeCompanyFromCookie = Cookies.get('activeCompany');
    const activeEnrollmentFromCookie = Cookies.get('activeEnrolment');
    Cookies.set('sss', 'sjhsj');

    if (activeEnrollmentFromCookie) {
        axios.defaults.headers.common['enrollment'] =
            activeEnrollmentFromCookie;
    }

    if (activeCompanyFromCookie) {
        axios.defaults.headers.common['organization'] = activeCompanyFromCookie;
    }
};

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [userData, setUserData] = useState<User>({});
    const dispatch = useDispatch<any>(); // Use useDispatch hook
    const [enrollments, setEnrollments] = useState([]);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            const storageModule = await import('../utils/storage');
            const storage: Storage = storageModule.default;

            await configureAxiosHeader(storage);

            const token = Cookies.get(
                process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME as string,
            );

            const activeCompanyFromCookie = Cookies.get('activeCompany');
            if (token) {
                setIsLoading(true);
                try {
                    const res = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/user/verify`,
                        {
                            organization: activeCompanyFromCookie,
                        },
                    );

                    if (res.status === 200 && res.data.success) {
                        // Use dispatch directly instead of dispatchSafely
                        dispatch(loadNotifications());
                        dispatch(getMyNavigations());

                        setUserData(res.data.user);
                        setIsLoading(false);
                        dispatch(setUser(res.data.user));

                        dispatch(setMyEnrollments(res.data.enrollments));
                        setEnrollments(res.data?.enrollments);
                        if (activeCompanyFromCookie) {
                            axios.defaults.headers.common['organization'] =
                                activeCompanyFromCookie;

                            dispatch(
                                setCompanyFeatures(res.data.features || []),
                            );
                            await connectSocket();
                            dispatch(loadChats());
                            dispatch(getOnlines());
                            dispatch(
                                getCommunityPosts({
                                    limit: 10,
                                    activePage: 1,
                                    reset: false,
                                }),
                            );
                        }
                    }
                } catch (err: any) {
                    console.error(err);
                    setIsLoading(false);
                    Cookies.remove(
                        process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME as string,
                        {
                            domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
                        },
                    );
                    toast.error(
                        err?.response?.data?.error || 'Something went wrong',
                    );
                    dispatch(logout());
                    // window.location.href = process.env
                    //     .NEXT_PUBLIC_REDIRECT_URL as string;
                }
            } else {
                setTimeout(async () => {
                    await persistor.pause();
                    await persistor.flush();
                    await persistor.purge();

                    Cookies.remove(
                        process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME as string,
                        {
                            domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
                        },
                    );
                    Cookies.remove('activeCompany', {
                        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
                    });
                    Cookies.remove('activeEnrolment', {
                        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
                    });
                    setIsLoading(false);
                }, 200);

                // window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL as string}/auth/login`;
            }
        };

        fetchData();

        return () => {
            disconnectSocket();
        };
    }, []); // Add dispatch to dependency array

    // Update loading spinner to use Tailwind instead of inline styles
    if (isLoading) {
        return (
            <div className='h-screen w-screen flex justify-center items-center'>
                <Loader className='animate-spin' />
            </div>
        );
    }

    // Pass userData as a prop to children using React.cloneElement
    return (
        <React.Fragment>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child);
                }
                return child;
            })}

            <CombinedSelectionModal myEnrollments={enrollments} />
        </React.Fragment>
    );
};

export default AuthWrapper;
