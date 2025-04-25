'use client';

import GlobalHeader from '@/components/global/GlobalHeader';
import { RadialProgress } from '@/components/global/RadialProgress';
import ProgramCard from '../../switch-program/_components/ProgramCard';
import TopPerformersSkeleton from './TopPerformersSkeleton';
import GlobalModal from '@/components/global/GlobalModal';
import ReviewModal from '@/components/shared/review-modal';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import {
    useGetLeaderboardQuery,
    useMyProgramQuery,
} from '@/redux/api/myprogram/myprogramApi';
import { useGetPortalDataQuery } from '@/redux/api/dashboard/calendarApi';
import { useAppSelector } from '@/redux/hooks';
import { TBootcampResult, TProgram } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import dayjs from 'dayjs';

// Types

type Status = 'approved' | 'pending' | 'cancelled';
type PerformanceLevel =
    | 'Outstanding Performance'
    | 'Good Performance'
    | 'Need Improvements';
type MedalType = 'green' | 'gold' | 'red';

interface Metrics {
    totalMark: number;
    totalObtainedMark: number;
    overallPercentageAllItems: number;
}

interface User {
    profilePicture: string;
    lastName: string;
    _id: string;
    firstName: string;
    fullName: string;
}

interface LeaderboardEntry {
    _id: string;
    metrics: Metrics;
    enrollment: string;
    user: User;
    rank: number;
}

type Leaderboard = LeaderboardEntry[];

const LeaderBoard = () => {
    const { user } = useAppSelector((state) => state.auth);
    const router = useRouter();
    const [filterPeriod, setFilterPeriod] = useState('weekly');

    const { data, isLoading } = useGetLeaderboardQuery({});
    const leaderboard: Leaderboard = data?.results || [];

    const { data: myProgram } = useMyProgramQuery({});
    const programData: TProgram = myProgram?.program;

    const { data: portalData } = useGetPortalDataQuery({ bootcamp: {} });
    const bootcamp: TBootcampResult[] = portalData?.data?.bootcamp?.results;
    console.log({ programData });
    const program = {
        id: '1',
        title: programData?.title,
        image: programData?.image,
        rating: 5.0,
        status: 'approved' as Status,
        user: {
            name: programData?.instructor?.name,
            avatar: programData?.instructor?.image,
            online: programData?.instructor?.isActive,
        },
        organization: 'N/A',
        branch: 'TS4U IT Engineer Bootcamps',
        date: dayjs(programData?.createdAt).format('MMM-YYYY'),
        payment: { totalFee: 0, paid: 0, due: 0 },
        switched: true,
        bootcamp,
    };

    const userProgress = {
        name: user?.fullName,
        avatar: user?.profilePicture,
        rank: data?.myData?.rank,
        score: data?.myData?.metrics?.totalObtainedMark,
        improvement: data?.myData?.metrics?.overallPercentageAllItems,
    };

    const getPerformance = (rank: number): PerformanceLevel => {
        if (rank <= 3) {
            return 'Outstanding Performance';
        }
        if (rank <= 7) {
            return 'Good Performance';
        }
        return 'Need Improvements';
    };

    const getMedalType = (rank: number): MedalType => {
        if (rank <= 3) {
            return 'green';
        }
        if (rank <= 7) {
            return 'gold';
        }
        return 'red';
    };

    const renderMedalIcon = (type: MedalType, rank: number) => {
        const baseClasses =
            'w-10 h-10 rounded-full flex items-center justify-center';
        const srcMap: Record<MedalType, string> = {
            green: '/images/leaderboard/first.png',
            gold: '/images/leaderboard/second.png',
            red: '/images/leaderboard/redsign.png',
        };
        return (
            <div className={baseClasses}>
                <Image
                    width={40}
                    height={40}
                    className='object-cover'
                    src={srcMap[type]}
                    alt={`top performer ${rank}`}
                />
            </div>
        );
    };

    return (
        <>
            <div className='pt-2'>
                <GlobalHeader
                    title={
                        <span className='flex items-center justify-center gap-1'>
                            <ArrowLeft
                                onClick={() => router.push('/program')}
                                size={18}
                                className='cursor-pointer'
                            />
                            Leaderboard
                        </span>
                    }
                    subTitle='Track Your Progress, Reach the Top'
                />

                <div className='my-2 flex flex-col lg:flex-row gap-2'>
                    {/* Sidebar */}
                    <div>
                        <ProgramCard
                            program={program as any}
                            key={program.id}
                        />

                        <div className='bg-foreground rounded-xl overflow-hidden border border-border mt-2.5 p-2.5'>
                            <h3 className='font-semibold text-black capitalize'>
                                Your Progress
                            </h3>
                            <div className='flex items-center gap-3 my-2'>
                                <Image
                                    src={userProgress.avatar || '/avatar.png'}
                                    alt={userProgress.name || 'User Avatar'}
                                    width={40}
                                    height={40}
                                    className='rounded-full'
                                />
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
                                    />
                                </div>
                            </div>

                            <div className='flex items-center gap-2 text-gray text-xs font-medium'>
                                <Image
                                    width={16}
                                    height={16}
                                    className='object-cover'
                                    src='/images/leaderboard/redsign.png'
                                    alt='need improvements'
                                />
                                <span>Need Improvements</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className='flex-1'>
                        <div className='bg-background rounded-xl overflow-hidden'>
                            <div className='flex justify-between py-2'>
                                <div className='flex items-center gap-2'>
                                    <Image
                                        width={24}
                                        height={24}
                                        src='/images/leaderboard/top.png'
                                        alt='top performers'
                                    />
                                    <h3 className='text-black text-lg font-bold'>
                                        Top Performers
                                    </h3>
                                </div>
                                <Select
                                    value={filterPeriod}
                                    onValueChange={setFilterPeriod}
                                >
                                    <SelectTrigger className='w-[98px] h-9 border-border bg-foreground mr-1'>
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

                            {isLoading ? (
                                <TopPerformersSkeleton />
                            ) : (
                                <div className='overflow-x-auto'>
                                    <table className='w-full table-auto'>
                                        <tbody>
                                            {leaderboard.map((performer) => (
                                                <tr
                                                    key={performer._id}
                                                    className='bg-foreground border border-border shadow-sm px-2 md:px-4 py-2 md:py-3 space-x-2'
                                                >
                                                    <td className='py-2 pl-2 md:py-3 md:pl-4 w-12'>
                                                        {renderMedalIcon(
                                                            getMedalType(
                                                                performer.rank,
                                                            ),
                                                            performer.rank,
                                                        )}
                                                    </td>
                                                    <td className='py-2 md:py-3 w-12'>
                                                        <div className='profile-clip w-8 h-8 md:w-10 md:h-10 bg-primary-light rounded-full flex items-center justify-center text-primary-white font-medium text-sm md:text-base'>
                                                            {performer.rank}
                                                        </div>
                                                    </td>
                                                    <td className='py-2 md:py-3 min-w-[160px]'>
                                                        <div className='flex items-center gap-1'>
                                                            <div className='relative'>
                                                                <Image
                                                                    src='/avatar.png'
                                                                    alt={
                                                                        performer
                                                                            .user
                                                                            .fullName
                                                                    }
                                                                    width={40}
                                                                    height={40}
                                                                    className='w-9 h-9 md:w-11 md:h-11 rounded-full'
                                                                />
                                                                <div className='absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white' />
                                                            </div>
                                                            <span className='text-sm font-semibold text-black whitespace-nowrap'>
                                                                {
                                                                    performer
                                                                        .user
                                                                        .fullName
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className='py-2 md:py-3 min-w-16'>
                                                        <div className='text-xs font-medium text-gray'>
                                                            Score
                                                        </div>
                                                        <div className='text-sm font-semibold text-black'>
                                                            {
                                                                performer
                                                                    .metrics
                                                                    .totalObtainedMark
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className='py-2 md:py-3 min-w-24'>
                                                        <div className='text-xs font-medium text-gray'>
                                                            Improvement
                                                        </div>
                                                        <div className='text-sm font-semibold text-black'>
                                                            {
                                                                performer
                                                                    .metrics
                                                                    .overallPercentageAllItems
                                                            }
                                                            %
                                                        </div>
                                                    </td>
                                                    <td className='py-2 md:py-3 min-w-24'>
                                                        <div className='font-semibold text-xs text-dark-gray'>
                                                            {getPerformance(
                                                                performer.rank,
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className='py-2 pr-2 md:py-3 md:pr-4 w-16'>
                                                        <div className='flex justify-center'>
                                                            <RadialProgress
                                                                value={
                                                                    performer
                                                                        .metrics
                                                                        .overallPercentageAllItems
                                                                }
                                                                size='sm'
                                                                thickness='medium'
                                                                color={
                                                                    performer.rank <=
                                                                    3
                                                                        ? 'success'
                                                                        : performer.rank <=
                                                                            7
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LeaderBoard;
