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
        totalAnswers?: number;
        completionRate?: number;
        totalTechnicalQuestions?: number;
        totalTechnicalTasks?: number;
        totalTechnicalAssignments?: number;
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
    // First row metrics
    const firstRowMetrics: Metric[] = [
        {
            title: 'Total Tests',
            value:
                (stats?.totalTechnicalTasks || 0) +
                (stats?.totalTechnicalAssignments || 0) +
                (stats?.totalTechnicalQuestions || 0),
            icon: Shield,
            type: 'default',
            color: '#27AC1F',
        },
        {
            title: 'Technical Task',
            value: stats?.totalTechnicalTasks || 0,
            icon: FileText,
            type: 'default',
            color: '#F37004',
        },
        {
            title: 'Assignments',
            value: stats?.totalTechnicalAssignments || 0,
            icon: ClipboardList,
            type: 'default',
            color: '#0CA9B2',
        },
        {
            title: 'Technical Question',
            value: stats?.totalTechnicalQuestions || 0,
            icon: MessageCircleQuestion,
            type: 'default',
            color: '#F34141',
        },
        {
            title: 'Completion Rate',
            value: `${stats?.completionRate}%`,
            icon: TrendingUp,
            type: 'progress',
            progressValue: stats?.completionRate,
            color: '#27AC1F',
        },
    ];

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 lg:gap-4 gap-2'>
            {firstRowMetrics.map((metric, index) => (
                <MetricCard key={index} metric={metric} />
            ))}
        </div>
    );
}

// Component for rendering individual metric cards
function MetricCard({ metric }: { metric: Metric }) {
    const Icon = metric.icon;

    return (
        <Card className='shadow-none  lg::my-2 bg-foreground'>
            <CardContent className='flex flex-col p-2 h-full justify-center'>
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
                            {50}
                        </p>
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
