import { useGetTopContributersApiQuery } from '@/redux/api/community/community';
import { IUserWithCount } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TopContributorsSkeleton from './TopContributorsSkeleton';

interface ITopContributorsProps {
    setUser?: (value: string) => void;
    setPage?: (value: number) => void;
    setPosts?: (value: any[]) => void;
    setHasMore?: (value: boolean) => void;
    user?: string; // Add user prop to track currently selected user
}

// TopContributors component

const TopContributors = ({
    setUser,
    setPage,
    setPosts,
    setHasMore,
    user,
}: ITopContributorsProps) => {
    const { data, isLoading } = useGetTopContributersApiQuery({});

    if (isLoading) {
        return <TopContributorsSkeleton />;
    }
    console.log({ data });
    const topContributors: IUserWithCount[] =
        data.users.filter(
            (entry: IUserWithCount) =>
                typeof entry.user === 'object' && entry.user !== null,
        ) || [];

    // Handler for user selection
    const handleUserSelect = (userId: string) => {
        // If clicking the same user again, clear the filter
        if (userId === user) {
            if (setUser) {
                setUser('');
            }
        } else {
            if (setUser) {
                setUser(userId);
            }
        }

        // Reset pagination and posts
        if (setPage) {
            setPage(1);
        }
        if (setPosts) {
            setPosts([]);
        }
        if (setHasMore) {
            setHasMore(true);
        }
    };
    // console.log({ user, topContributors });
    return (
        <Card className='overflow-hidden border-border bg-foreground shadow-sm mt-2 mr-2'>
            <CardHeader className='bg-foreground pb-3 pt-4 px-4 border-b border-border'>
                <h2 className='text-xl font-semibold text-black'>
                    Top Contributors
                </h2>
            </CardHeader>
            <CardContent className='my-2 mx-2.5 p-0'>
                <div className=''>
                    {topContributors.map((contributor, index) => (
                        <div
                            key={index}
                            onClick={() =>
                                handleUserSelect(contributor.user._id)
                            }
                            className={`flex cursor-pointer items-center gap-3 p-2 mb-1.5 rounded-lg ${
                                user === contributor.user._id
                                    ? 'bg-primary text-white'
                                    : 'bg-background hover:bg-primary-light'
                            }`}
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

                                {/* <div
                                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full  bg-green-500 ring-1 ring-background`}
                                ></div> */}
                            </div>
                            <div className='flex-1'>
                                <h3
                                    className={`font-medium ${user === contributor.user._id ? 'text-white' : 'text-black'}`}
                                >
                                    {contributor?.user?.fullName}
                                </h3>
                                <p
                                    className={`text-xs ${user === contributor.user._id ? 'text-white/80' : 'text-gray'}`}
                                >
                                    {contributor?.count} Posts • 560 Comments •{' '}
                                    50 React
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {topContributors.length === 0 && (
                    <div className='py-6 text-center text-gray'>
                        <p>No contributors available</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TopContributors;
