import { RadialProgress } from '@/components/global/RadialProgress';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TProgram, TProgramMain, TProgressChart } from '@/types';
import { TEnrollment } from '@/types/auth';
import {
    ArrowRight,
    Calendar,
    Users,
    Building,
    BookOpen,
    Clock,
    CheckCircle,
    Award,
    Layers,
    BarChart2,
    Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const activeProgram = {
    id: '1',
    title: 'AWS DevOps and CloudOps Engineer',
    slug: 'aws-devops-cloudops',
    image: '/placeholder.svg?height=400&width=800',
    instructor: {
        name: 'John Doe',
        image: '/placeholder.svg?height=80&width=80',
        role: 'CloudOps Engineer',
    },
    session: {
        name: '2024-May-June',
    },
    progress: 20,
    technologies: [
        { name: 'HTML', icon: '/placeholder.svg?height=48&width=48' },
        { name: 'JavaScript', icon: '/placeholder.svg?height=48&width=48' },
        { name: 'GitHub', icon: '/placeholder.svg?height=48&width=48' },
        { name: 'Docker', icon: '/placeholder.svg?height=48&width=48' },
        { name: 'Kubernetes', icon: '/placeholder.svg?height=48&width=48' },
        { name: 'AWS', icon: '/placeholder.svg?height=48&width=48' },
    ],
    stats: [
        { label: 'Modules', value: 12, icon: <Layers className='h-4 w-4' /> },
        {
            label: 'Assignments',
            value: 24,
            icon: <BookOpen className='h-4 w-4' />,
        },
        { label: 'Projects', value: 4, icon: <Award className='h-4 w-4' /> },
        { label: 'Hours', value: 120, icon: <Clock className='h-4 w-4' /> },
    ],
    upcomingEvents: [
        {
            title: 'MERN Weekly Interview Webinar with CEO',
            date: 'May 15, 2024',
            time: '10:00 AM - 12:00 PM',
        },
        {
            title: '100% Job Placement Workshop with Shiblu Ahmed',
            date: 'May 18, 2024',
            time: '2:00 PM - 4:00 PM',
        },
    ],
    recentAchievements: [
        {
            title: 'Completed AWS Crash Course',
            date: 'May 5, 2024',
            badge: 'Gold',
        },
        {
            title: 'Cypress Automation Certification',
            date: 'April 28, 2024',
            badge: 'Silver',
        },
    ],
};

interface TExtendedEnrollment {
    branch: {
        name: string;
    };
    organization: {
        name: string;
    };
}

const ActiveProgram = ({
    program,
    myProgram,
    myProgress,
    enrollment,
}: {
    program: TProgram;
    myProgram: TProgramMain;
    myProgress: TProgressChart;
    enrollment: any;
}) => {
    return (
        <div>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2 mb-3 py-2 px-3 bg-foreground rounded-xl overflow-hidden border border-border items-center'>
                <div className=''>
                    <div className='flex items-center gap-2 mb-4'>
                        <span className='bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1'>
                            <CheckCircle className='h-3 w-3' />
                            Active Program
                        </span>
                        <span className='bg-primary-light text-primary px-2 py-1 rounded-full text-xs font-medium'>
                            Professional Track
                        </span>
                    </div>

                    <h2 className='text-xl font-semibold text-black mb-1'>
                        {program?.title}
                    </h2>

                    <div className='grid md:grid-cols-2 gap-6 mb-6'>
                        <div className='space-y-3'>
                            <div className='flex items-center gap-2'>
                                <Building className='h-5 w-5 text-gray' />
                                <div>
                                    <span className='text-gray text-sm'>
                                        Company
                                    </span>
                                    <p className='font-medium text-black'>
                                        {enrollment?.organization?.name}
                                    </p>
                                </div>
                            </div>

                            <div className='flex items-center gap-2'>
                                <Users className='h-5 w-5 text-gray' />
                                <div>
                                    <span className='text-gray text-sm'>
                                        Branch
                                    </span>
                                    <p className='font-medium text-black'>
                                        {enrollment?.branch?.name}
                                    </p>
                                </div>
                            </div>

                            <div className='flex items-center gap-2'>
                                <Calendar className='h-5 w-5 text-gray' />
                                <div>
                                    <span className='text-gray text-sm'>
                                        Session
                                    </span>
                                    <p className='font-medium text-black'>
                                        {myProgram?.session?.name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className='flex items-center gap-3 mb-4'>
                                <div className='w-12 h-12 rounded-full bg-background overflow-hidden flex-shrink-0 border-2 border-border shadow-sm'>
                                    <Image
                                        src={
                                            program?.instructor?.image ||
                                            '/avatar.png'
                                        }
                                        alt={program?.instructor?.name}
                                        width={48}
                                        height={48}
                                        className='object-cover'
                                    />
                                </div>
                                <div>
                                    <div className='font-medium text-black'>
                                        {program?.instructor?.name}
                                    </div>
                                    <div className='text-sm text-gray flex items-center gap-1'>
                                        {program?.instructor?.email}
                                    </div>
                                </div>
                            </div>

                            <div className='mb-2'>
                                <div className='flex items-center justify-between mb-1'>
                                    <span className='text-black font-medium'>
                                        Overall Progress
                                    </span>
                                    <span className='text-primary font-semibold'>
                                        {
                                            myProgress?.metrics
                                                ?.overallPercentageAllItems
                                        }
                                        %
                                    </span>
                                </div>
                                <Progress
                                    value={
                                        myProgress?.metrics
                                            ?.overallPercentageAllItems
                                    }
                                    className='h-3 bg-primary-light rounded-full'
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-2 mt-4'>
                                {activeProgram.stats.map((stat, index) => (
                                    <div
                                        key={index}
                                        className='flex items-center gap-2'
                                    >
                                        <div className='w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary'>
                                            {stat.icon}
                                        </div>
                                        <div>
                                            <div className='text-sm text-gray'>
                                                {stat.label}
                                            </div>
                                            <div className='font-semibold text-black'>
                                                {stat.value}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Link
                        href={`/program/${program?.slug}`}
                        className='inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light text-white hover:text-pure-black rounded-md transition-colors font-medium'
                    >
                        Go to Bootcamp <ArrowRight className='w-4 h-4' />
                    </Link>
                </div>

                <div className='flex justify-center items-center'>
                    <Image
                        src={program?.image || '/program.png'}
                        alt={program?.title}
                        width={640}
                        height={360}
                        className='object-contain md:object-cover rounded-lg'
                    />
                </div>
            </div>
            {/* Program Details Tabs */}
            <Tabs defaultValue='overview' className='mb-4'>
                <TabsList className='bg-background border border-border p-1 rounded-lg'>
                    <TabsTrigger
                        value='overview'
                        className='rounded-md data-[state=active]:bg-primary-light data-[state=active]:text-primary'
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value='curriculum'
                        className='rounded-md data-[state=active]:bg-primary-light data-[state=active]:text-primary'
                    >
                        Curriculum
                    </TabsTrigger>
                    <TabsTrigger
                        value='resources'
                        className='rounded-md data-[state=active]:bg-primary-light data-[state=active]:text-primary'
                    >
                        Resources
                    </TabsTrigger>
                    <TabsTrigger
                        value='community'
                        className='rounded-md data-[state=active]:bg-primary-light data-[state=active]:text-primary'
                    >
                        Community
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='overview' className='mt-2'>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {/* Program Progress Card */}
                        <div className='bg-foreground rounded-xl border border-border shadow-sm overflow-hidden'>
                            <div className='p-5 border-b border-border'>
                                <h3 className='font-semibold text-black flex items-center gap-2'>
                                    <BarChart2 className='h-5 w-5 text-primary' />
                                    Your Progress
                                </h3>
                            </div>
                            <div className='p-5'>
                                <div className='flex items-center justify-between mb-4'>
                                    <div>
                                        <div className='text-sm text-gray'>
                                            Overall Completion
                                        </div>
                                        <div className='text-2xl font-bold text-black'>
                                            {
                                                myProgress?.metrics
                                                    ?.overallPercentageAllItems
                                            }
                                            %
                                        </div>
                                    </div>

                                    {/* Replaced SVG with RadialProgress component */}
                                    <RadialProgress
                                        value={
                                            myProgress?.metrics
                                                ?.overallPercentageAllItems
                                        }
                                        size='md'
                                        thickness='medium'
                                        color='primary'
                                    />
                                </div>

                                <div className='space-y-3'>
                                    <div>
                                        <div className='flex items-center justify-between mb-1'>
                                            <span className='text-sm text-dark-gray'>
                                                Modules
                                            </span>
                                            <span className='text-sm font-medium'>
                                                3/12
                                            </span>
                                        </div>
                                        <Progress
                                            value={25}
                                            className='h-2 bg-primary-light'
                                        />
                                    </div>
                                    <div>
                                        <div className='flex items-center justify-between mb-1'>
                                            <span className='text-sm text-dark-gray'>
                                                Assignments
                                            </span>
                                            <span className='text-sm font-medium'>
                                                5/24
                                            </span>
                                        </div>
                                        <Progress
                                            value={20.8}
                                            className='h-2 bg-primary-light'
                                        />
                                    </div>
                                    <div>
                                        <div className='flex items-center justify-between mb-1'>
                                            <span className='text-sm text-dark-gray'>
                                                Projects
                                            </span>
                                            <span className='text-sm font-medium'>
                                                1/4
                                            </span>
                                        </div>
                                        <Progress
                                            value={25}
                                            className='h-2 bg-primary-light'
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Events Card */}
                        <div className='bg-foreground rounded-xl border border-border shadow-sm overflow-hidden'>
                            <div className='p-5 border-b border-border'>
                                <h3 className='font-semibold text-black flex items-center gap-2'>
                                    <Calendar className='h-5 w-5 text-primary' />
                                    Upcoming Events
                                </h3>
                            </div>
                            <div className='p-5'>
                                <div className='space-y-4'>
                                    {activeProgram.upcomingEvents.map(
                                        (event, index) => (
                                            <div
                                                key={index}
                                                className='flex gap-3'
                                            >
                                                <div className='w-12 h-12 bg-primary-light rounded-lg flex flex-col items-center justify-center text-primary flex-shrink-0'>
                                                    <span className='text-xs'>
                                                        MAY
                                                    </span>
                                                    <span className='font-bold'>
                                                        {
                                                            event.date
                                                                .split(',')[0]
                                                                .split(' ')[1]
                                                        }
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className='font-medium text-black'>
                                                        {event.title}
                                                    </h4>
                                                    <p className='text-sm text-gray'>
                                                        {event.time}
                                                    </p>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>

                                {/* <button className='w-full mt-4 text-sm text-primary font-medium py-2 border border-border-primary-light rounded-md hover:bg-primary-light transition-colors'>
                                    View All Events
                                </button> */}
                            </div>
                        </div>

                        {/* Recent Achievements Card */}
                        <div className='bg-foreground rounded-xl border border-border shadow-sm overflow-hidden'>
                            <div className='p-5 border-b border-border'>
                                <h3 className='font-semibold text-black flex items-center gap-2'>
                                    <Award className='h-5 w-5 text-primary' />
                                    Recent Achievements
                                </h3>
                            </div>
                            <div className='p-5'>
                                <div className='space-y-4'>
                                    {activeProgram.recentAchievements.map(
                                        (achievement, index) => (
                                            <div
                                                key={index}
                                                className='flex gap-3'
                                            >
                                                <div className='w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0'>
                                                    {achievement.badge ===
                                                    'Gold' ? (
                                                        <span className='text-yellow-600 text-lg'>
                                                            🏆
                                                        </span>
                                                    ) : (
                                                        <span className='text-gray text-lg'>
                                                            🥈
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className='font-medium text-black'>
                                                        {achievement.title}
                                                    </h4>
                                                    <p className='text-sm text-gray'>
                                                        {achievement.date}
                                                    </p>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>

                                <div className='mt-4 p-3 bg-primary-light rounded-lg border border-border-primary-light'>
                                    <div className='flex items-center gap-2'>
                                        <Zap className='h-5 w-5 text-primary' />
                                        <div className='text-sm text-dark-gray'>
                                            <span className='font-medium'>
                                                Pro Tip:
                                            </span>{' '}
                                            Complete the next module to earn a
                                            new badge!
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value='curriculum'>
                    <div className='bg-background rounded-xl border border-border p-6'>
                        <h3 className='text-lg font-semibold mb-4'>
                            Curriculum content will be displayed here
                        </h3>
                        <p className='text-gray'>
                            This tab would contain the detailed curriculum for
                            the AWS DevOps and CloudOps Engineer program.
                        </p>
                    </div>
                </TabsContent>

                <TabsContent value='resources'>
                    <div className='bg-background rounded-xl border border-border p-6'>
                        <h3 className='text-lg font-semibold mb-4'>
                            Resources content will be displayed here
                        </h3>
                        <p className='text-gray'>
                            This tab would contain learning resources,
                            downloads, and reference materials.
                        </p>
                    </div>
                </TabsContent>

                <TabsContent value='community'>
                    <div className='bg-background rounded-xl border border-border p-6'>
                        <h3 className='text-lg font-semibold mb-4'>
                            Community content will be displayed here
                        </h3>
                        <p className='text-gray'>
                            This tab would contain community discussions,
                            forums, and collaboration tools.
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ActiveProgram;
