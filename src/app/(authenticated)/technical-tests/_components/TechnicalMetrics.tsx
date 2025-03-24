import {
    Shield,
    FileText,
    ClipboardList,
    MessageCircleQuestion,
    TrendingUp,
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
};

export default function TechnicalMetrics() {
    // Array of metrics data
    const metrics: Metric[] = [
        {
            title: 'Total Tests',
            value: 14,
            subtext: '+2 New tests',
            icon: Shield,
            type: 'default',
        },
        {
            title: 'Technical Task',
            value: 22,
            subtext: '5 pending',
            icon: FileText,
            type: 'default',
        },
        {
            title: 'Assignments',
            value: 12,
            subtext: '2 pending',
            icon: ClipboardList,
            type: 'default',
        },
        {
            title: 'Technical Question',
            value: 23,
            subtext: '2 pending',
            icon: MessageCircleQuestion,
            type: 'default',
        },
        {
            title: 'Completion Rate',
            value: '85%',
            icon: TrendingUp,
            type: 'progress',
            progressValue: 85,
        },
    ];

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            {metrics.map((metric, index) => (
                <MetricCard key={index} metric={metric} />
            ))}
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
                    <div className='h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center'>
                        <div className='h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center'>
                            <Icon className='h-5 w-5 text-blue-600' />
                        </div>
                    </div>
                    <div>
                        <h3 className='text-base'>{metric.title}</h3>
                        <p className='text-xl font-semibold'>{metric.value}</p>
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
                            className='bg-blue-600 h-2.5 rounded-full'
                            style={{ width: `${metric.progressValue}%` }}
                        ></div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
