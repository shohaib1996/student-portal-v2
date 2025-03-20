import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ViewMoreLink } from './view-more-link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentItem } from './document-item';
import { OverviewIcon, UpcomingIcon } from '@/components/svgs/dashboard'; // Added icons import

export function DocumentsSection() {
    return (
        <Card className='p-2'>
            <CardHeader className='flex flex-row items-center justify-between p-2 border-b'>
                <div>
                    <h4 className='text-md font-medium'>Documents</h4>
                    <p className='text-xs text-muted-foreground'>
                        Access all your files
                    </p>
                </div>
                <ViewMoreLink href='#' />
            </CardHeader>
            <CardContent className='p-2'>
                <Tabs defaultValue='my-documents' className='border-b mt-1'>
                    <TabsList className='bg-transparent'>
                        <TabsTrigger
                            value='my-documents'
                            className='border-b rounded-none data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-1 text-xs'
                        >
                            <OverviewIcon className='text-gray data-[state=active]:text-primary' />
                            My Documents
                        </TabsTrigger>
                        <TabsTrigger
                            value='documents-labs'
                            className='border-b rounded-none data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-1 text-xs'
                        >
                            <UpcomingIcon className='data-[state=active]:text-primary' />
                            Documents & Labs
                        </TabsTrigger>
                        <TabsTrigger
                            value='presentations'
                            className='border-b rounded-none data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-1 text-xs'
                        >
                            <UpcomingIcon className='data-[state=active]:text-primary' />
                            Presentations
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent
                        value='my-documents'
                        className='mt-1 space-y-2'
                    >
                        <DocumentItem
                            title='Test Document - For Upload File'
                            description='Bootcamps Hub is a comprehensive all-in-one SaaS platform meticulously crafted to empower high-ticket coaches. It simplifies their operations.'
                            date='Jan 30, 2024'
                            time='12:30 PM'
                            readTime={5}
                            imageSrc='/images/interview-item-thumbnail.png'
                        />
                        <DocumentItem
                            title='Test Document - For Upload File'
                            description='Bootcamps Hub is a comprehensive all-in-one SaaS platform meticulously crafted to empower high-ticket coaches. It simplifies their operations.'
                            date='Jan 30, 2024'
                            time='12:30 PM'
                            readTime={5}
                            imageSrc='/images/interview-item-thumbnail.png'
                        />
                        <DocumentItem
                            title='Test Document - For Upload File'
                            description='Bootcamps Hub is a comprehensive all-in-one SaaS platform meticulously crafted to empower high-ticket coaches. It simplifies their operations.'
                            date='Jan 30, 2024'
                            time='12:30 PM'
                            readTime={5}
                            imageSrc='/images/interview-item-thumbnail.png'
                        />
                    </TabsContent>
                    <TabsContent value='documents-labs'>
                        <div className='py-4 text-center text-sm text-muted-foreground'>
                            No documents and labs to display
                        </div>
                    </TabsContent>
                    <TabsContent value='presentations'>
                        <div className='py-4 text-center text-sm text-muted-foreground'>
                            No presentations to display
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
