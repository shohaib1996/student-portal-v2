'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ViewMoreLink } from './view-more-link';
import { ModuleItem } from './module-item';
import { useGetPortalDataQuery } from '@/redux/api/dashboard/calendarApi';

export function BootcampsSection() {
    const {
        data: portalData,
        isLoading,
        error,
    } = useGetPortalDataQuery({ bootcamp: {} });

    if (isLoading) {
        return (
            <div className='flex justify-center items-center py-4'>
                <div>Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex justify-center items-center py-4 text-red-500'>
                <div>Error: Failed to load bootcamp data</div>
            </div>
        );
    }

    // Process the data to match ModuleItem structure
    interface BootcampItem {
        category: {
            slug: string;
            name: string;
        };
        completedItems: number;
        pinnedItems: number;
        totalItems: number;
    }

    interface BootcampData {
        icon: string;
        title: string;
        uploadCount: number;
        pinnedCount: number;
        completionPercentage: number;
    }

    const bootcampData: BootcampData[] =
        (portalData?.data?.bootcamp?.results &&
            portalData?.data?.bootcamp?.results.map((item: BootcampItem) => ({
                icon: item.category.slug, // Use slug for icon matching
                title: item.category.name,
                uploadCount: item.totalItems || 0,
                pinnedCount: item.pinnedItems || 0,
                completionPercentage:
                    item.totalItems > 0
                        ? Math.round(
                              (item.completedItems / item.totalItems) * 100,
                          )
                        : 0,
            }))) ||
        [];

    // Calculate total completed bootcamps
    const totalCompleted: number =
        portalData?.data?.bootcamp?.results?.reduce(
            (sum: number, item: BootcampItem) =>
                sum + (item.completedItems || 0),
            0,
        ) || 0;

    return (
        <Card className='p-2 rounded-lg shadow-none bg-foreground'>
            <CardHeader className='flex flex-row items-center justify-between p-2 border-b'>
                <div className=''>
                    <div className='flex items-center'>
                        <h3 className='text-md font-medium'>Bootcamps</h3>
                        <Badge
                            variant='outline'
                            className='ml-2 bg-primary/10 text-primary rounded-full'
                        >
                            {isLoading
                                ? 'Loading...'
                                : `${totalCompleted} complete`}
                        </Badge>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                        Explore all bootcamps overview at a Glance
                    </p>
                </div>
                <ViewMoreLink href='/program' />
            </CardHeader>
            <CardContent className='p-2'>
                <div className='space-y-2'>
                    {bootcampData.map((item, index) => (
                        <ModuleItem
                            key={index}
                            icon={item.icon}
                            title={item.title}
                            uploadCount={item.uploadCount}
                            pinnedCount={item.pinnedCount}
                            completionPercentage={item.completionPercentage}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
