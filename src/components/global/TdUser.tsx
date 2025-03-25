import Image from 'next/image';
import { cn } from '@/lib/utils';
import { TUser } from '@/types/auth';
import { useAppSelector } from '@/redux/hooks';

export function TdUser({
    user,
    className,
}: {
    user: TUser;
    className?: string;
}) {
    const { onlineUsers } = useAppSelector((s) => s.chat);

    const isOnline = onlineUsers?.find((u) => u?._id === user?._id);

    return (
        <div className={cn('flex items-center gap-3', className)}>
            <div className='relative'>
                <div className='size-7 rounded-full overflow-hidden'>
                    <Image
                        src={user?.profilePicture || '/avatar.png'}
                        alt={`${user?.firstName}'s avatar`}
                        width={40}
                        height={40}
                        className='object-cover'
                    />
                </div>

                <div
                    className={cn(
                        'absolute bottom-0 right-0 h-3 w-3 rounded-full bg-gray border-2 border-pure-white',
                        {
                            'bg-green-500': isOnline,
                        },
                    )}
                />
            </div>
            <div className='flex flex-col text-start'>
                <span className='text-sm font-medium text-black'>
                    {user?.fullName}
                </span>
                <span className='text-xs text-gray'>{user?.email}</span>
            </div>
        </div>
    );
}
