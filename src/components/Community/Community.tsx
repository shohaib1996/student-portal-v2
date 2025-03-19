'use client';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { filters } from '@/utils/filterData';
import { useFilter } from '@/utils/useFilters';
import { ArrowLeft, FilterIcon, Hash, Menu, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import CommunityPosts from './CommunityPosts';
import TopTags from './TopTags';
import TopContributors from './TopContributors';
import { useGetCommunityPostsApiMutation } from '@/redux/api/community/community';
import { ICommunityPost } from '@/types';
import { useInView } from 'react-intersection-observer';
import CommunityPostSkeleton from './CommunityPostSkeleton';
import { toast } from 'sonner';
import CreatePost from './CreatePost';
import CommunitySidebar from './CommunitySidebar';
import GlobalHeader from '../global/GlobalHeader';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UpcomingEvents from './UpcomingEvents';

interface ErrorProps {
    status: number;
    data: {
        error: string;
        success: boolean;
    };
}

const Community = () => {
    const [posts, setPosts] = useState<ICommunityPost[]>([]);
    const { selectedFilter, selectFilter, setSelectedFilter } = useFilter();
    const [searchValue, setSearchValue] = useState('');
    const [page, setPage] = useState(1);
    const [tags, setTags] = useState<string[]>([]);
    const [user, setUser] = useState<string>('');
    const [hasMore, setHasMore] = useState(true);
    const [refetch, setRefetch] = useState<number>(1);
    const [totalPosts, setTotalPosts] = useState(0); // 🔹 Track total available posts
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            setSearchValue((event.target as HTMLInputElement).value);
            setPage(1);
            setPosts([]);
            setHasMore(true);
        }
    };

    const [getPosts, { isLoading, error }] = useGetCommunityPostsApiMutation();

    const fetchPosts = async () => {
        if (!hasMore) {
            return;
        } // 🔹 Prevent unnecessary API calls

        const payload = {
            page,
            limit: 10,
            query: searchValue,
            tags,
            user,
            filterBy: selectedFilter,
        };

        try {
            const response = await getPosts({ payload }).unwrap();
            if (response.success) {
                setTotalPosts(response.count || 0); // 🔹 Store total count from response

                if (page === 1) {
                    setPosts(response.posts || []); // 🔹 Reset posts if new search/filter applied
                } else {
                    setPosts((prev) => [...prev, ...response.posts]);
                }
                // 🔹 Stop fetching if all posts are loaded
                setHasMore(page * 10 < response.count);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (error) {
            toast.error((error as ErrorProps).data.error);
        }
    }, [error]);

    useEffect(() => {
        fetchPosts();
    }, [page, searchValue, selectedFilter, tags, user, refetch]);

    // Intersection Observer Hook
    const { ref, inView } = useInView({
        threshold: 0.5,
    });

    useEffect(() => {
        if (inView && hasMore && !isLoading) {
            setPage((prev) => prev + 1);
        }
    }, [inView, hasMore, isLoading]);

    const handleClear = () => {
        setSearchValue('');
        setSelectedFilter('');
        setPosts([]);
        setPage(1);
        setTags([]);
        setUser('');
        setHasMore(true);
    };

    const handleTagDelete = (selectTag: string) => {
        setTags((prev) => prev.filter((tag) => tag !== selectTag));
    };

    return (
        <div>
            {!isSidebarOpen && (
                <Button
                    className='fixed bottom-5 right-5 z-50 flex items-center gap-2 p-3 md:hidden'
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu size={20} />
                    Filters
                </Button>
            )}

            {/* Sidebar Component */}
            <CommunitySidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                tags={tags}
                setTags={setTags}
                setUser={setUser}
            />
            <GlobalHeader
                title='Community'
                subTitle='Connect, Collaborate, and Grow Together'
                buttons={
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='outline' className='gap-2'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='20'
                                    height='20'
                                    viewBox='0 0 20 20'
                                    fill='none'
                                >
                                    <path
                                        d='M18.3333 14.584H12.5'
                                        stroke='#5C5958'
                                        stroke-width='1.5'
                                        stroke-miterlimit='10'
                                        stroke-linecap='round'
                                        stroke-linejoin='round'
                                    />
                                    <path
                                        d='M4.16406 14.584H1.66406'
                                        stroke='#5C5958'
                                        stroke-width='1.5'
                                        stroke-miterlimit='10'
                                        stroke-linecap='round'
                                        stroke-linejoin='round'
                                    />
                                    <path
                                        d='M18.3359 5.41602H15.8359'
                                        stroke='#5C5958'
                                        stroke-width='1.5'
                                        stroke-miterlimit='10'
                                        stroke-linecap='round'
                                        stroke-linejoin='round'
                                    />
                                    <path
                                        d='M7.4974 5.41602H1.66406'
                                        stroke='#5C5958'
                                        stroke-width='1.5'
                                        stroke-miterlimit='10'
                                        stroke-linecap='round'
                                        stroke-linejoin='round'
                                    />
                                    <path
                                        d='M5.83073 12.084H10.8307C11.7474 12.084 12.4974 12.5007 12.4974 13.7507V15.4173C12.4974 16.6673 11.7474 17.084 10.8307 17.084H5.83073C4.91406 17.084 4.16406 16.6673 4.16406 15.4173V13.7507C4.16406 12.5007 4.91406 12.084 5.83073 12.084Z'
                                        stroke='#5C5958'
                                        stroke-width='1.5'
                                        stroke-miterlimit='10'
                                        stroke-linecap='round'
                                        stroke-linejoin='round'
                                    />
                                    <path
                                        d='M9.16667 2.91602H14.1667C15.0833 2.91602 15.8333 3.33268 15.8333 4.58268V6.24935C15.8333 7.49935 15.0833 7.91602 14.1667 7.91602H9.16667C8.25 7.91602 7.5 7.49935 7.5 6.24935V4.58268C7.5 3.33268 8.25 2.91602 9.16667 2.91602Z'
                                        stroke='#5C5958'
                                        stroke-width='1.5'
                                        stroke-miterlimit='10'
                                        stroke-linecap='round'
                                        stroke-linejoin='round'
                                    />
                                </svg>
                                Filters{' '}
                                {selectedFilter ? `(${selectedFilter})` : ''}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='w-56'>
                            <DropdownMenuLabel>
                                Filter Category
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup className='space-y-1'>
                                <DropdownMenuItem
                                    className='hover:bg-primary hover:text-white cursor-pointer'
                                    onClick={handleClear}
                                >
                                    Clear
                                </DropdownMenuItem>
                                {filters.map(({ label, filter }) => (
                                    <DropdownMenuItem
                                        key={filter}
                                        onClick={() => selectFilter(filter)}
                                        className={
                                            selectedFilter === filter
                                                ? 'bg-primary text-white'
                                                : 'hover:bg-primary hover:text-white cursor-pointer'
                                        }
                                    >
                                        {label}{' '}
                                        {selectedFilter === filter && '✓'}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
            />

            <div className='flex h-screen items-center gap-2 py-3'>
                <div className='no-scrollbar h-full flex-[2] overflow-y-auto overflow-x-hidden pr-2'>
                    {tags.length > 0 && (
                        <div className='bg-background rounded-xl p-2 shadow-sm border border-border-primary-light mb-2'>
                            <div className='flex items-center gap-2 mb-3'>
                                <Hash className='h-5 w-5 text-primary' />
                                <h3 className='font-medium text-black'>
                                    Filtered by Tags
                                </h3>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                {tags.map((tag) => (
                                    <div
                                        key={tag}
                                        className='group relative flex items-center gap-1 rounded-full bg-primary-light px-3 py-1.5 text-sm font-medium text-primary transition-all hover:bg-primary-light'
                                    >
                                        #{tag}
                                        <button
                                            onClick={() => handleTagDelete(tag)}
                                            className='ml-1 rounded-full bg-background p-0.5 text-red-500 opacity-0 transition-opacity group-hover:opacity-100'
                                            aria-label={`Remove ${tag} tag`}
                                        >
                                            <svg
                                                width='14'
                                                height='14'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                            >
                                                <path
                                                    d='M18 6L6 18M6 6L18 18'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <CreatePost refetch={refetch} setRefetch={setRefetch} />
                    </div>

                    {posts.map((post, index) => (
                        <CommunityPosts
                            key={index}
                            post={post}
                            refetch={refetch}
                            setRefetch={setRefetch}
                            ref={index === posts.length - 1 ? ref : null} // Attach ref to last post
                        />
                    ))}

                    {isLoading && (
                        <div>
                            <CommunityPostSkeleton />
                            <CommunityPostSkeleton />
                            <CommunityPostSkeleton />
                            <CommunityPostSkeleton />
                        </div>
                    )}

                    {/* 🔹 Show message when no more posts are available */}
                    {!hasMore && (
                        <p className='mt-4 text-center text-gray'>
                            No more posts to load 🎉
                        </p>
                    )}
                </div>

                <div className='hidden flex-1 flex-col md:flex'>
                    <div className='no-scrollbar sticky top-0 h-screen overflow-y-auto'>
                        <UpcomingEvents />
                        <TopContributors setUser={setUser} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Community;
