import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ViewMoreLink } from './view-more-link';
import { Badge } from '@/components/ui/badge';
import { ModuleItem } from './module-item';

export function BootcampsSection() {
    return (
        <Card className='p-2'>
            <CardHeader className='flex flex-row items-center justify-between p-2 border-b'>
                <div className=''>
                    <div className='flex items-center'>
                        <CardTitle className='text-md font-medium'>
                            Bootcamps
                        </CardTitle>
                        <Badge
                            variant='outline'
                            className='ml-2 bg-primary/10 text-primary rounded-full'
                        >
                            25 complete
                        </Badge>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                        Explore all bootcamps overview at a Glance
                    </p>
                </div>
                <ViewMoreLink href='#' />
            </CardHeader>
            <CardContent className='p-2'>
                <div className='mt-4 space-y-4'>
                    <ModuleItem
                        icon='module'
                        title='Module'
                        uploadCount={23}
                        pinnedCount={56}
                        completionPercentage={60}
                    />
                    <ModuleItem
                        icon='workshop'
                        title='Workshop'
                        uploadCount={23}
                        pinnedCount={56}
                        completionPercentage={22}
                    />
                    <ModuleItem
                        icon='interviews'
                        title='Interviews'
                        uploadCount={23}
                        pinnedCount={56}
                        completionPercentage={45}
                    />
                    <ModuleItem
                        icon='labs'
                        title='Labs'
                        uploadCount={23}
                        pinnedCount={56}
                        completionPercentage={35}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
