'use client';

import GlobalHeader from '@/components/global/GlobalHeader';
import { RadialProgress } from '@/components/global/RadialProgress';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    Building,
    Calendar,
    Check,
    Filter,
    Package,
    Star,
    UploadCloud,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import ProgramCard from '../../switch-program/_components/ProgramCard';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Types
type Status = 'approved' | 'pending' | 'cancelled';
type PerformanceLevel =
    | 'Outstanding Performance'
    | 'Good Performance'
    | 'Need Improvements';
type MedalType = 'green' | 'gold' | 'red';
interface Performer {
    id: number;
    rank: number;
    name: string;
    avatar: string;
    score: number;
    improvement: number;
    performance: PerformanceLevel;
    online?: boolean;
}

const LeaderBoard = () => {
    const router = useRouter();
    const [filterPeriod, setFilterPeriod] = useState('weekly');

    const program = {
        id: '1',
        title: 'AWS DevOps And CloudOps Engineer',
        image: '/switchprogram.jpg',
        rating: 5.0,
        status: 'approved' as Status,
        user: {
            name: 'John Doe',
            avatar: '/avatar.png',
            online: true,
        },
        organization: 'Org With Logo',
        branch: 'TS4U IT Engineer Bootcamps',
        date: 'Dec-2023',
        payment: {
            totalFee: 12000,
            paid: 4000,
            due: 8000,
        },
        progress: 65,
        switched: true,
    };

    // Mock data for top performers
    const topPerformers: Performer[] = [
        {
            id: 1,
            rank: 1,
            name: 'Dianne Russell',
            avatar: '/placeholder.svg?height=40&width=40',
            score: 876,
            improvement: 98,
            performance: 'Outstanding Performance',
            online: true,
        },
        {
            id: 2,
            rank: 2,
            name: 'Arlene McCoy',
            avatar: '/placeholder.svg?height=40&width=40',
            score: 856,
            improvement: 85,
            performance: 'Outstanding Performance',
            online: true,
        },
        {
            id: 3,
            rank: 3,
            name: 'Ralph Edwards',
            avatar: '/placeholder.svg?height=40&width=40',
            score: 798,
            improvement: 82,
            performance: 'Outstanding Performance',
            online: true,
        },
        {
            id: 4,
            rank: 4,
            name: 'Courtney Henry',
            avatar: '/placeholder.svg?height=40&width=40',
            score: 755,
            improvement: 75,
            performance: 'Good Performance',
        },
        {
            id: 5,
            rank: 5,
            name: 'Guy Hawkins',
            avatar: '/placeholder.svg?height=40&width=40',
            score: 743,
            improvement: 70,
            performance: 'Good Performance',
            online: true,
        },
        {
            id: 6,
            rank: 6,
            name: 'Eleanor Pena',
            avatar: '/placeholder.svg?height=40&width=40',
            score: 723,
            improvement: 70,
            performance: 'Good Performance',
        },
        {
            id: 7,
            rank: 7,
            name: 'Marvin McKinney',
            avatar: '/placeholder.svg?height=40&width=40',
            score: 687,
            improvement: 65,
            performance: 'Good Performance',
        },
        {
            id: 8,
            rank: 8,
            name: 'Darlene Robertson',
            avatar: '/placeholder.svg?height=40&width=40',
            score: 645,
            improvement: 55,
            performance: 'Need Improvements',
        },
        {
            id: 9,
            rank: 9,
            name: 'Jerome Bell',
            avatar: '/placeholder.svg?height=40&width=40',
            score: 567,
            improvement: 45,
            performance: 'Need Improvements',
            online: true,
        },
        {
            id: 10,
            rank: 10,
            name: 'Albert Flores',
            avatar: '/placeholder.svg?height=40&width=40',
            score: 543,
            improvement: 45,
            performance: 'Need Improvements',
            online: true,
        },
        {
            id: 11,
            rank: 11,
            name: 'Brooklyn Simmons',
            avatar: '/placeholder.svg?height=40&width=40',
            score: 543,
            improvement: 40,
            performance: 'Need Improvements',
            online: true,
        },
        {
            id: 12,
            rank: 12,
            name: 'Bessie Cooper',
            avatar: '/placeholder.svg?height=40&width=40',
            score: 543,
            improvement: 35,
            performance: 'Need Improvements',
            online: true,
        },
    ];

    // User progress data
    const userProgress = {
        name: 'Vivienne Westwood',
        avatar: '/placeholder.svg?height=40&width=40',
        rank: 20,
        score: 543,
        improvement: 45,
    };

    // Helper function to determine medal type based on rank
    const getMedalType = (rank: number): MedalType => {
        if (rank <= 3) {
            return 'green';
        }
        if (rank <= 7) {
            return 'gold';
        }
        return 'red';
    };

    // Helper function to render medal icon
    const renderMedalIcon = (type: MedalType, rank: number) => {
        const baseClasses =
            'w-10 h-10 rounded-full flex items-center justify-center';

        if (type === 'green') {
            return (
                <div className={`${baseClasses}`}>
                    <Image
                        width={512}
                        height={512}
                        className='h-10 w-10 object-cover'
                        src='/images/leaderboard/first.png'
                        alt='top perform first'
                    />
                </div>
            );
        }

        if (type === 'gold') {
            return (
                <div className={`${baseClasses}`}>
                    <Image
                        width={512}
                        height={512}
                        className='h-10 w-10 object-cover'
                        src='/images/leaderboard/second.png'
                        alt='top perform 2'
                    />
                </div>
            );
        }

        return (
            <div className={`${baseClasses}`}>
                <Image
                    width={512}
                    height={512}
                    className='h-10 w-10 object-cover'
                    src='/images/leaderboard/redsign.png'
                    alt='top perform red'
                />
            </div>
        );
    };

    // Helper function to get progress color
    const getProgressColor = (performance: PerformanceLevel): string => {
        switch (performance) {
            case 'Outstanding Performance':
                return 'success';
            case 'Good Performance':
                return 'warning';
            case 'Need Improvements':
                return 'danger';
            default:
                return 'primary';
        }
    };

    return (
        <>
            <GlobalHeader
                title={
                    <span className='flex items-center justify-center gap-1'>
                        <ArrowLeft
                            onClick={() => router.push('/dashboard/program')}
                            size={18}
                            className='cursor-pointer'
                        />
                        Leaderboard
                    </span>
                }
                subTitle='Track Your Progress, Reach the Top'
                buttons={
                    <div>
                        <Button
                            variant={'ghost'}
                            icon={<UploadCloud size={18} />}
                        ></Button>
                        <Button
                            variant='outline'
                            size='sm'
                            className='h-9 gap-1 text-dark-gray'
                        >
                            <Filter size={18} />
                            Filters
                        </Button>
                    </div>
                }
            />

            <div className='my-2'>
                <div className='flex flex-col lg:flex-row gap-2'>
                    {/* Left Sidebar */}
                    <div className=''>
                        {/* Program Card */}
                        <ProgramCard program={program} key={program.id} />

                        {/* User Progress */}
                        <div className='bg-foreground rounded-xl overflow-hidden border border-border mt-2.5 p-2.5'>
                            <h3 className='font-semibold text-black capitalize'>
                                Your Progress
                            </h3>

                            <div>
                                <div className='flex items-center gap-3 my-2'>
                                    <div className='relative'>
                                        <Image
                                            src='/avatar.png'
                                            alt={userProgress.name}
                                            width={40}
                                            height={40}
                                            className='rounded-full'
                                        />
                                    </div>
                                    <span className='font-medium text-black'>
                                        {userProgress.name}
                                    </span>
                                </div>

                                <div className='grid grid-cols-3 gap-2 mb-3'>
                                    <div className='bg-[#FBF5FF] p-3 rounded-lg'>
                                        <div className='text-xs text-gray'>
                                            Current Rank
                                        </div>
                                        <div className='font-semibold text-base text-[#875BC9]'>
                                            #{userProgress.rank}
                                        </div>
                                    </div>
                                    <div className='bg-yellow-50 p-3 rounded-lg'>
                                        <div className='text-xs text-gray'>
                                            Your Score
                                        </div>
                                        <div className='font-bold text-yellow-600'>
                                            {userProgress.score}
                                        </div>
                                    </div>
                                    <div className='bg-green-50 p-3 rounded-lg'>
                                        <div className='text-xs text-gray'>
                                            Improvement
                                        </div>
                                        <div className='font-bold text-green-600'>
                                            {userProgress.improvement}%
                                        </div>
                                    </div>
                                </div>

                                <div className='relative pt-1 mb-2'>
                                    <div className='overflow-hidden h-2 text-xs flex rounded bg-primary-light'>
                                        <div
                                            style={{
                                                width: `${userProgress.improvement}%`,
                                            }}
                                            className='shadow-none flex flex-col text-center whitespace-nowrap justify-center bg-primary'
                                        ></div>
                                    </div>
                                </div>

                                <div className='flex items-center gap-2 text-gray text-xs font-medium'>
                                    <Image
                                        width={512}
                                        height={512}
                                        className='h-4 w-5 object-cover'
                                        src='/images/leaderboard/redsign.png'
                                        alt='top perform'
                                    />
                                    <span>Need Improvements</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Leaderboard */}
                    <div className='flex-1'>
                        <div className='bg-background rounded-xl overflow-hidden'>
                            <div className='flex justify-between py-2'>
                                <div className='flex items-center gap-2'>
                                    <Image
                                        width={512}
                                        height={512}
                                        className='h-6 w-6 object-cover'
                                        src='/top.png'
                                        alt='top perform'
                                    />
                                    <h3 className='text-black text-lg font-bold'>
                                        Top Performers
                                    </h3>
                                </div>
                                <Select defaultValue='weekly'>
                                    <SelectTrigger className='w-[98px] h-9 border-border bg-foreground'>
                                        <SelectValue placeholder='Weekly' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='daily'>
                                            Daily
                                        </SelectItem>
                                        <SelectItem value='weekly'>
                                            Weekly
                                        </SelectItem>
                                        <SelectItem value='monthly'>
                                            Monthly
                                        </SelectItem>
                                        <SelectItem value='yearly'>
                                            Yearly
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='overflow-x-auto'>
                                <table className='w-full'>
                                    <tbody>
                                        {topPerformers.map((performer) => (
                                            <tr
                                                key={performer.id}
                                                className='bg-foreground border border-border py-3 px-4 shadow-sm'
                                            >
                                                <td className='py-3 pl-4'>
                                                    {renderMedalIcon(
                                                        getMedalType(
                                                            performer.rank,
                                                        ),
                                                        performer.rank,
                                                    )}
                                                </td>
                                                <td className='py-3'>
                                                    <div className='flex justify-center'>
                                                        <div className='profile-clip w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-primary font-medium'>
                                                            {performer.rank}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className='py-3'>
                                                    <div className='flex items-center gap-1.5'>
                                                        <div className='relative'>
                                                            <Image
                                                                src='/avatar.png'
                                                                alt={
                                                                    performer.name
                                                                }
                                                                width={40}
                                                                height={40}
                                                                className='w-11 h-11 rounded-full'
                                                            />
                                                            {performer.online && (
                                                                <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white'></div>
                                                            )}
                                                        </div>
                                                        <span className='text-lg font-semibold text-black'>
                                                            {performer.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className='py-3'>
                                                    <div className='text-xs font-medium text-gray'>
                                                        Score
                                                    </div>
                                                    <div className='text-base font-semibold text-black'>
                                                        {performer.score}
                                                    </div>
                                                </td>
                                                <td className='py-3'>
                                                    <div className='text-xs font-medium text-gray'>
                                                        Improvement
                                                    </div>
                                                    <div className='text-base font-semibold text-black'>
                                                        {performer.improvement}%
                                                    </div>
                                                </td>
                                                <td className='py-3'>
                                                    <div className='font-semibold text-sm text-dark-gray'>
                                                        {performer.performance}
                                                    </div>
                                                </td>
                                                <td className='py-3 pr-4'>
                                                    <div className='flex justify-center'>
                                                        <RadialProgress
                                                            value={
                                                                performer.improvement
                                                            }
                                                            size='md'
                                                            thickness='medium'
                                                            color={
                                                                performer.performance ===
                                                                'Outstanding Performance'
                                                                    ? 'success'
                                                                    : performer.performance ===
                                                                        'Good Performance'
                                                                      ? 'warning'
                                                                      : 'danger'
                                                            }
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LeaderBoard;
