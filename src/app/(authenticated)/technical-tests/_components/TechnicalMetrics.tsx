import {
    Shield,
    FileText,
    ClipboardList,
    MessageCircleQuestion,
    TrendingUp,
    CheckCircle,
    Clock,
    XCircle,
    type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Define the metric type
type Metric = {
    title: string;
    value: string | number;
    subtext?: string;
    icon: LucideIcon;
    type?: 'progress' | 'default';
    progressValue?: number;
    color?: string;
};

interface TechnicalMetricsProps {
    stats?: {
        totalQuestions?: number;
        totalAnswers?: Array<{
            status?: string;
        }>;
    };
    assignments?: Array<{
        category?: string;
        submission?: {
            status?: string;
        };
    }>;
}

export default function TechnicalMetrics({
    stats,
    assignments = [],
}: TechnicalMetricsProps) {
    // Calculate metrics based on props
    const totalAssignments = stats?.totalQuestions || 0;
    const totalAnswers = stats?.totalAnswers?.length || 0;
    const notAnswered = totalAssignments - totalAnswers;

    const technicalTasks =
        assignments.filter((x) => x?.category === 'task').length || 0;
    const technicalQuestions =
        assignments.filter((x) => x?.category === 'question').length || 0;
    const technicalAssignments =
        assignments.filter((x) => x?.category === 'assignment').length || 0;

    const acceptedAnswers =
        stats?.totalAnswers?.filter((x) => x?.status === 'accepted').length ||
        0;
    const pendingAnswers =
        stats?.totalAnswers?.filter((x) => x?.status === 'pending').length || 0;
    const rejectedAnswers =
        stats?.totalAnswers?.filter((x) => x?.status === 'rejected').length ||
        0;

    // Calculate completion rate
    const completionRate =
        totalAssignments > 0
            ? Math.round((totalAnswers / totalAssignments) * 100)
            : 0;

    // Calculate pending items for each category
    const pendingTasks = assignments.filter(
        (x) =>
            x?.category === 'task' &&
            (!x?.submission || x?.submission?.status === 'not_answered'),
    ).length;

    const pendingAssignments = assignments.filter(
        (x) =>
            x?.category === 'assignment' &&
            (!x?.submission || x?.submission?.status === 'not_answered'),
    ).length;

    const pendingQuestions = assignments.filter(
        (x) =>
            x?.category === 'question' &&
            (!x?.submission || x?.submission?.status === 'not_answered'),
    ).length;

    // First row metrics
    const firstRowMetrics: Metric[] = [
        {
            title: 'Total Tests',
            value: totalAssignments,
            subtext:
                notAnswered > 0
                    ? `${notAnswered} not answered`
                    : 'All answered',
            icon: Shield,
            type: 'default',
            color: '#27AC1F',
        },
        {
            title: 'Technical Task',
            value: technicalTasks,
            subtext:
                pendingTasks > 0 ? `${pendingTasks} pending` : 'All completed',
            icon: FileText,
            type: 'default',
            color: '#F37004',
        },
        {
            title: 'Assignments',
            value: technicalAssignments,
            subtext:
                pendingAssignments > 0
                    ? `${pendingAssignments} pending`
                    : 'All completed',
            icon: ClipboardList,
            type: 'default',
            color: '#0CA9B2',
        },
        {
            title: 'Technical Question',
            value: technicalQuestions,
            subtext:
                pendingQuestions > 0
                    ? `${pendingQuestions} pending`
                    : 'All completed',
            icon: MessageCircleQuestion,
            type: 'default',
            color: '#F34141',
        },
        {
            title: 'Completion Rate',
            value: `${completionRate}%`,
            icon: TrendingUp,
            type: 'progress',
            progressValue: completionRate,
            color: '#27AC1F',
        },
    ];

    // Second row metrics (assessment statistics)
    // const secondRowMetrics: Metric[] = [
    //     {
    //         title: 'Total Answers',
    //         value: totalAnswers,
    //         icon: Shield,
    //         type: 'default',
    //         color: '#27AC1F',
    //     },
    //     {
    //         title: 'Accepted',
    //         value: acceptedAnswers,
    //         icon: CheckCircle,
    //         type: 'default',
    //         color: '#00D7C4',
    //     },
    //     {
    //         title: 'Pending',
    //         value: pendingAnswers,
    //         icon: Clock,
    //         type: 'default',
    //         color: '#FF9900',
    //     },
    //     {
    //         title: 'Rejected',
    //         value: rejectedAnswers,
    //         icon: XCircle,
    //         type: 'default',
    //         color: '#F34141',
    //     },
    // ];

    return (
        <div className='space-y-6'>
            {/* <div>
                <h2 className='text-lg font-semibold mb-2'>
                    Total Assessments
                </h2>
                <p className='text-sm text-muted-foreground mb-4'>
                    This is the statistics of technical assignments
                </p>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
                    {firstRowMetrics.map((metric, index) => (
                        <MetricCard key={index} metric={metric} />
                    ))}
                </div>
            </div> */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
                {firstRowMetrics.map((metric, index) => (
                    <MetricCard key={index} metric={metric} />
                ))}
            </div>

            {/* <div>
                <h2 className='text-lg font-semibold mb-2'>
                    Assessments Statistics
                </h2>
                <p className='text-sm text-muted-foreground mb-4'>
                    This is the statistics of technical assignments
                </p>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                    {secondRowMetrics.map((metric, index) => (
                        <MetricCard key={index} metric={metric} />
                    ))}
                </div>
            </div> */}
        </div>
    );
}

// Component for rendering individual metric cards
function MetricCard({ metric }: { metric: Metric }) {
    const Icon = metric.icon;

    return (
        <Card className='shadow-none my-2 bg-foreground'>
            <CardContent className='flex flex-col p-2'>
                <div className='flex items-center gap-3'>
                    <div className='h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center'>
                        <div className='h-8 w-8 rounded-full bg-blue-500/30 flex items-center justify-center'>
                            <Icon
                                className={
                                    metric.color
                                        ? `h-5 w-5 text-[${metric.color}]`
                                        : 'text-primary h-5 w-5'
                                }
                            />
                        </div>
                    </div>
                    <div>
                        <h3 className='text-base'>{metric.title}</h3>
                        <p
                            className='text-xl font-semibold'
                            style={{ color: metric.color }}
                        >
                            {metric.value}
                        </p>
                        {metric.subtext && (
                            <p className='text-xs text-muted-foreground'>
                                {metric.subtext}
                            </p>
                        )}
                    </div>
                </div>

                {metric.type === 'progress' && (
                    <div className='w-full bg-gray-200 rounded-full h-2.5 mt-4'>
                        <div
                            className='h-2.5 rounded-full'
                            style={{
                                width: `${metric.progressValue}%`,
                                backgroundColor: metric.color || '#3B82F6',
                            }}
                        ></div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
