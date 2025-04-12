import { useGetTopTagsApiQuery } from '@/redux/api/community/community';
import { ITags } from '@/types';
import TopTagsSkeleton from './TopTagsSkeleton';
import { Badge } from '../ui/badge';
import { Hash, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ITopTagsProps {
    tags: string[];
    setTags: (tags: string[]) => void;
}

const TopTags = ({ tags, setTags }: ITopTagsProps) => {
    const { data, isLoading } = useGetTopTagsApiQuery({});
    if (isLoading) {
        return <TopTagsSkeleton />;
    }
    const topTags: ITags[] = data?.tags || [];
    const handleTags = (tag: string) => {
        setTags([...tags, tag]);
    };
    return (
        <Card className='overflow-hidden border-border shadow-sm mt-2 mr-2'>
            <CardHeader className='rounded-xl pb-3 pt-4'>
                <CardTitle className='flex font-semibold text-lg items-center gap-2 text-black'>
                    <Hash className='h-5 w-5 text-primary' />
                    Trending Tags
                </CardTitle>
            </CardHeader>
            <CardContent className='p-4 pt-0'>
                <div className='space-y-2'>
                    {topTags.map((tag) => (
                        <div
                            key={tag.name}
                            onClick={() => handleTags(tag.name)}
                            className='group flex cursor-pointer items-center justify-between rounded-lg border border-border bg-background p-3 transition-all hover:border-border-primary-light hover:bg-primary-light'
                        >
                            <div className='flex items-center gap-2'>
                                <Badge
                                    variant='secondary'
                                    className='bg-primary-light text-sm text-primary'
                                >
                                    #{tag.name}
                                </Badge>
                                <span className='text-sm text-gray'>
                                    {tag.count} posts
                                </span>
                            </div>
                            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-borborder-border text-gray opacity-0 transition-opacity group-hover:opacity-100 group-hover:bg-primary-light group-hover:text-primary'>
                                <Plus className='h-3.5 w-3.5' />
                            </div>
                        </div>
                    ))}
                </div>

                {topTags.length === 0 && (
                    <div className='py-6 text-center text-gray'>
                        <p>No trending tags available</p>
                    </div>
                )}

                {tags.length > 0 && (
                    <div className='mt-4 rounded-lg border border-border bg-primary-light p-3'>
                        <p className='mb-2 text-sm font-medium text-primary'>
                            Your selected tags:
                        </p>
                        <div className='flex flex-wrap gap-2'>
                            {tags.map((tag) => (
                                <Badge
                                    key={tag}
                                    variant='secondary'
                                    className='bg-primary-light text-primary'
                                >
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TopTags;
