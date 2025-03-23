'use client';

import type React from 'react';
import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2, X, Check, UserX, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlobalDialog from '@/components/global/GlobalDialogModal/GlobalDialog';
import { instance } from '@/lib/axios/axiosInstance';

interface User {
    _id: string;
    firstName?: string;
    fullName?: string;
}

interface Member {
    _id: string;
    user?: User;
    isBlocked?: boolean;
}

interface UserBlockProps {
    opened: boolean;
    close: () => void;
    member: Member | null;
    chat: string;
    handleUpdateCallback: (member: Member) => void;
}

const UserBlock: React.FC<UserBlockProps> = ({
    opened,
    close,
    member,
    chat,
    handleUpdateCallback,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const modalClose = useCallback(() => {
        close();
    }, [close]);

    const handleBlock = useCallback(() => {
        if (!member) {
            return;
        }

        setIsLoading(true);

        const data = {
            member: member?._id,
            chat: chat,
            actionType: member?.isBlocked ? 'Unblock' : 'block',
        };

        instance
            .post('/chat/member/update', data)
            .then((res) => {
                toast.success(
                    `${member?.isBlocked ? 'Unblocked' : 'Blocked'} successfully`,
                );
                handleUpdateCallback(res.data?.member);
                setIsLoading(false);
                modalClose();
            })
            .catch((err) => {
                console.log(err);
                toast.error(
                    err?.response?.data?.error ||
                        'Failed to update member status',
                );
                setIsLoading(false);
            });
    }, [member, chat, handleUpdateCallback, modalClose]);

    return (
        <GlobalDialog
            header={false}
            open={opened}
            setOpen={(open) => !open && modalClose()}
            className='sm:max-w-[500px]'
            allowFullScreen={false}
            // showCloseButton={false}
        >
            <div className='flex flex-col items-center px-6 py-4'>
                <div className='bg-red-100 rounded-full p-1 mb-2'>
                    <svg
                        width='63'
                        height='62'
                        viewBox='0 0 63 62'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <rect
                            x='0.5'
                            width='62'
                            height='62'
                            rx='31'
                            fill='#FBE8E8'
                        />
                        <path
                            d='M20.25 22.5625C20.25 20.6156 20.8274 18.7124 21.909 17.0936C22.9906 15.4748 24.528 14.2131 26.3267 13.4681C28.1255 12.723 30.1047 12.5281 32.0142 12.9079C33.9237 13.2877 35.6777 14.2252 37.0544 15.6019C38.431 16.9786 39.3686 18.7326 39.7484 20.6421C40.1282 22.5516 39.9333 24.5308 39.1882 26.3295C38.4432 28.1283 37.1815 29.6656 35.5627 30.7473C33.9439 31.8289 32.0407 32.4063 30.0938 32.4063C27.4846 32.4013 24.9837 31.3626 23.1387 29.5176C21.2937 27.6726 20.255 25.1717 20.25 22.5625ZM50.1 40.375C50.1037 41.5756 49.861 42.7641 49.3869 43.8671C48.9128 44.9701 48.2174 45.964 47.3438 46.7875H47.25C45.6166 48.3272 43.4572 49.1856 41.2125 49.1875C39.4898 49.1939 37.8025 48.6985 36.3567 47.7617C34.9109 46.8248 33.7693 45.4872 33.0713 43.9122C32.3733 42.3372 32.1491 40.593 32.4261 38.8927C32.7032 37.1923 33.4694 35.6095 34.6313 34.3375C34.6313 34.3375 34.6313 34.2063 34.7625 34.15C35.5846 33.2861 36.5735 32.598 37.6693 32.1275C38.7651 31.657 39.945 31.4137 41.1375 31.4125C42.3166 31.405 43.4854 31.6318 44.5761 32.0795C45.6669 32.5273 46.6579 33.1872 47.4916 34.0209C48.3254 34.8546 48.9853 35.8456 49.433 36.9364C49.8808 38.0271 50.1075 39.1959 50.1 40.375ZM44.175 45.6625L35.9063 37.4125C35.3738 38.3347 35.0947 39.3812 35.0973 40.4461C35.0998 41.5109 35.384 42.5561 35.9209 43.4757C36.4577 44.3953 37.2283 45.1565 38.1543 45.6821C39.0804 46.2078 40.129 46.4792 41.1938 46.4688C42.2411 46.4665 43.2693 46.1884 44.175 45.6625ZM47.2875 40.375C47.2878 39.2705 46.9878 38.1868 46.4198 37.2396C45.8517 36.2924 45.0369 35.5174 44.0625 34.9975C43.0881 34.4776 41.9907 34.2322 40.8877 34.2877C39.7846 34.3432 38.7174 34.6974 37.8 35.3125L46.2563 43.7688C46.9321 42.7663 47.2913 41.584 47.2875 40.375ZM31.5938 33.85C31.4667 33.689 31.3041 33.5595 31.1187 33.4717C30.9333 33.3839 30.7301 33.3401 30.525 33.3438H25.6313C22.8271 33.3552 20.1021 34.2749 17.8644 35.965C15.6267 37.6551 13.9968 40.0246 13.2188 42.7188C13.0052 43.4862 12.9717 44.2925 13.1208 45.075C13.2699 45.8575 13.5976 46.595 14.0785 47.2301C14.5593 47.8652 15.1803 48.3807 15.893 48.7365C16.6057 49.0922 17.391 49.2787 18.1875 49.2813H31.725C31.9216 49.2827 32.1164 49.2435 32.2971 49.1661C32.4778 49.0886 32.6405 48.9746 32.775 48.8313C32.844 48.742 32.9066 48.648 32.9625 48.55C31.0736 46.6337 29.9055 44.1233 29.656 41.4442C29.4065 38.765 30.0912 36.0821 31.5938 33.85Z'
                            fill='#DF2B2B'
                        />
                    </svg>
                </div>

                <h2 className='text-2xl font-semibold text-center mb-2'>
                    {member?.isBlocked
                        ? `Do you want to unblock?`
                        : `Do you want to block?`}
                </h2>

                <p className='text-center text-muted-foreground mb-2'>
                    {member?.isBlocked
                        ? `Allow ${member?.user?.fullName || member?.user?.fullName} to message and engage in the crowd.`
                        : `Restrict ${member?.user?.fullName || member?.user?.fullName} from messaging and engaging in the crowd.`}
                </p>

                <div className='flex flex-row items-center justify-center gap-3 w-full'>
                    <Button
                        variant='primary_light'
                        onClick={modalClose}
                        disabled={isLoading}
                        className='flex-1  max-w-[150px]'
                    >
                        <XCircle className='h-4 w-4 ' />
                        No
                    </Button>

                    <Button
                        variant={!member?.isBlocked ? 'default' : 'destructive'}
                        onClick={handleBlock}
                        disabled={isLoading}
                        className={
                            !member?.isBlocked
                                ? 'flex-1 max-w-[150px]'
                                : 'flex-1 destructive bg-red-500/10 text-danger max-w-[150px]'
                        }
                    >
                        {isLoading ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                            <Check className='h-4 w-4' />
                        )}
                        Yes
                    </Button>
                </div>
            </div>
        </GlobalDialog>
    );
};

export default UserBlock;
