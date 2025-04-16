import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedTableLoader } from './EnhancedTableLoader';
import { ShimmerTableLoader } from './ShimmerTableLoader';

export default function TableLoaderDemo() {
    return (
        <div className='space-y-8 p-6'>
            <h1 className='text-2xl font-bold'>Table Loader Components</h1>

            <Tabs defaultValue='enhanced'>
                <TabsList className='mb-4'>
                    <TabsTrigger value='enhanced'>Enhanced Loader</TabsTrigger>
                    <TabsTrigger value='shimmer'>Shimmer Loader</TabsTrigger>
                </TabsList>

                <TabsContent value='enhanced' className='space-y-8'>
                    <div>
                        <h2 className='mb-4 text-xl font-semibold'>
                            Background Variant
                        </h2>
                        <EnhancedTableLoader rows={5} bgColor='background' />
                    </div>

                    <div>
                        <h2 className='mb-4 text-xl font-semibold'>
                            Foreground Variant
                        </h2>
                        <EnhancedTableLoader rows={5} bgColor='foreground' />
                    </div>

                    <div>
                        <h2 className='mb-4 text-xl font-semibold'>
                            Compact Density
                        </h2>
                        <EnhancedTableLoader
                            rows={3}
                            bgColor='background'
                            density='compact'
                        />
                    </div>

                    <div>
                        <h2 className='mb-4 text-xl font-semibold'>
                            Comfortable Density
                        </h2>
                        <EnhancedTableLoader
                            rows={3}
                            bgColor='foreground'
                            density='comfortable'
                        />
                    </div>
                </TabsContent>

                <TabsContent value='shimmer' className='space-y-8'>
                    <div>
                        <h2 className='mb-4 text-xl font-semibold'>
                            Background Variant with Shimmer
                        </h2>
                        <ShimmerTableLoader rows={5} bgColor='background' />
                    </div>

                    <div>
                        <h2 className='mb-4 text-xl font-semibold'>
                            Foreground Variant with Shimmer
                        </h2>
                        <ShimmerTableLoader rows={5} bgColor='foreground' />
                    </div>

                    <div>
                        <h2 className='mb-4 text-xl font-semibold'>
                            Compact Density with Shimmer
                        </h2>
                        <ShimmerTableLoader
                            rows={3}
                            bgColor='background'
                            density='compact'
                        />
                    </div>

                    <div>
                        <h2 className='mb-4 text-xl font-semibold'>
                            Comfortable Density with Shimmer
                        </h2>
                        <ShimmerTableLoader
                            rows={3}
                            bgColor='foreground'
                            density='comfortable'
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
