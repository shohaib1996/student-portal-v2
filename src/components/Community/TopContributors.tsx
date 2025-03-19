import { useGetTopContributersApiQuery } from '@/redux/api/community/community';
import { IUserWithCount } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TopContributorsSkeleton from './TopContributorsSkeleton';

interface ITopContributorsProps {
    setUser: (value: string) => void;
}

// Mock data for top contributors
const mockTopContributors = [
    {
        user: {
            _id: 'user1',
            fullName: 'John Doe',
            profilePicture: '/avatar.png',
            online: true,
        },
        stats: {
            posts: 56,
            comments: 560,
            reactions: 50,
        },
    },
    {
        user: {
            _id: 'user2',
            fullName: 'Brooklyn Simmons',
            profilePicture: '/avatar.png',
            online: false,
        },
        stats: {
            posts: 56,
            comments: 560,
            reactions: 50,
        },
    },
    {
        user: {
            _id: 'user3',
            fullName: 'John Doe',
            profilePicture: '/avatar.png',
            online: true,
        },
        stats: {
            posts: 56,
            comments: 560,
            reactions: 50,
        },
    },
    {
        user: {
            _id: 'user4',
            fullName: 'John Doe',
            profilePicture: '/avatar.png',
            online: false,
        },
        stats: {
            posts: 56,
            comments: 560,
            reactions: 50,
        },
    },
    {
        user: {
            _id: 'user5',
            fullName: 'John Doe',
            profilePicture: '/avatar.png',
            online: true,
        },
        stats: {
            posts: 56,
            comments: 560,
            reactions: 50,
        },
    },
];

const TopContributors = ({ setUser }: ITopContributorsProps) => {
    const { data, isLoading } = useGetTopContributersApiQuery({});
    if (isLoading) {
        return <TopContributorsSkeleton />;
    }
    const topContributors: IUserWithCount[] = data?.users || [];
    return (
        <Card className='overflow-hidden border-border bg-foreground shadow-sm mt-2 mr-2'>
            <CardHeader className='bg-foreground pb-3 pt-4 px-4 border-b border-border'>
                <h2 className='text-xl font-semibold text-black'>
                    Top Contributors
                </h2>
            </CardHeader>
            <CardContent className='my-2 mx-2.5 p-0'>
                <div className=''>
                    {mockTopContributors.map((contributor, index) => (
                        <div
                            key={index}
                            onClick={() => setUser(contributor.user._id)}
                            className='flex cursor-pointer items-center bg-background gap-3 p-2 hover:bg-primary-light mb-1.5 rounded-lg'
                        >
                            <div className='relative'>
                                <Avatar className='h-10 w-10'>
                                    <AvatarImage
                                        src={
                                            contributor?.user?.profilePicture ||
                                            'https://static.vecteezy.com/system/resources/thumbnails/002/002/403/small/man-with-beard-avatar-character-isolated-icon-free-vector.jpg'
                                        }
                                        alt={
                                            contributor?.user?.fullName ||
                                            'Contributor'
                                        }
                                    />
                                    <AvatarFallback>
                                        {contributor?.user?.fullName?.charAt(
                                            0,
                                        ) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                {contributor?.user?.online && (
                                    <div className='absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-background'></div>
                                )}
                            </div>
                            <div className='flex-1'>
                                <h3 className='font-medium text-black'>
                                    {contributor?.user?.fullName}
                                </h3>
                                <p className='text-xs text-gray'>
                                    {contributor?.stats.posts} Posts •{' '}
                                    {contributor?.stats.comments} Comments •{' '}
                                    {contributor?.stats.reactions} React
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {mockTopContributors.length === 0 && (
                    <div className='py-6 text-center text-gray'>
                        <p>No contributors available</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TopContributors;
