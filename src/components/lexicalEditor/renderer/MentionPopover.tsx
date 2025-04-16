'use client';

import { useEffect, useState, useRef } from 'react';
import {
    CalendarDays,
    Mail,
    MapPin,
    Briefcase,
    BookOpen,
    Clock,
    ExternalLink,
    MessageSquare,
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface User {
    id: string;
    name: string;
    role: string;
    program: string;
    session: string;
    avatar: string;
    department?: string;
    location?: string;
    email?: string;
    joinDate?: string;
    status?: 'online' | 'away' | 'offline';
    bio?: string;
    skills?: string[];
}

interface MentionPopoverProps {
    userId: string;
    userName: string;
}

// Enhanced user data fetch function
const fetchUserInfo = async (userId: string): Promise<User> => {
    // In a real app, this would be an API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: userId,
                name: 'John Doe',
                role: 'Senior Software Engineer',
                program: 'Full Stack Development',
                session: 'Spring 2025',
                avatar: `https://i.pravatar.cc/150?u=${userId}`,
                department: 'Engineering',
                location: 'San Francisco, CA',
                email: 'john.doe@example.com',
                joinDate: 'January 2023',
                status: 'online',
                bio: 'Full-stack developer with 5+ years of experience in React and Node.js',
                skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
            });
        }, 300);
    });
};

export function MentionPopover({ userId, userName }: MentionPopoverProps) {
    const [user, setUser] = useState<User | null>(null);
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (open) {
            fetchUserInfo(userId).then(setUser);
        }
    }, [userId, open]);

    useEffect(() => {
        const handleScroll = () => {
            if (open) {
                setOpen(false);
            }
        };
        document.addEventListener('scroll', handleScroll, true);
        return () => {
            document.removeEventListener('scroll', handleScroll, true);
        };
    }, [open]);

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'online':
                return 'bg-green-500';
            case 'away':
                return 'bg-yellow-500';
            case 'offline':
                return 'bg-gray-400';
            default:
                return 'bg-gray-400';
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <span
                    ref={triggerRef}
                    className='mention text-primary hover:underline cursor-pointer font-medium'
                >
                    @{userName}
                </span>
            </PopoverTrigger>
            <PopoverContent
                className='w-80 p-0 shadow-lg border-border/40 overflow-hidden'
                align='start'
            >
                {user ? (
                    <div className='flex flex-col'>
                        {/* Header with background */}
                        <div className='bg-gradient-to-r from-primary/10 to-primary/5 p-4 relative'>
                            <div className='flex items-start gap-4'>
                                <div className='relative'>
                                    <Avatar className='h-16 w-16 border-2 border-background shadow-sm'>
                                        <AvatarImage
                                            src={
                                                user.avatar ||
                                                '/placeholder.svg'
                                            }
                                            alt={user.name}
                                        />
                                        <AvatarFallback className='text-lg'>
                                            {user.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div
                                        className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${getStatusColor(user.status)}`}
                                    />
                                </div>
                                <div className='flex-1 space-y-1'>
                                    <div className='flex items-center justify-between'>
                                        <h3 className='font-semibold text-lg leading-tight'>
                                            {user.name}
                                        </h3>
                                        <Badge
                                            variant='outline'
                                            className={`${user.status === 'online' ? 'bg-green-500/10 text-green-600' : user.status === 'away' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-gray-200 text-gray-600'}`}
                                        >
                                            {user.status === 'online'
                                                ? 'Online'
                                                : user.status === 'away'
                                                  ? 'Away'
                                                  : 'Offline'}
                                        </Badge>
                                    </div>
                                    <p className='text-sm font-medium text-foreground/80'>
                                        {user.role}
                                    </p>
                                    <p className='text-xs text-muted-foreground flex items-center gap-1'>
                                        <Briefcase className='h-3 w-3' />
                                        {user.department}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* User details */}
                        <div className='p-4 space-y-3'>
                            <div className='grid grid-cols-1 gap-2 text-sm'>
                                <div className='flex items-center gap-2 text-muted-foreground'>
                                    <MapPin className='h-3.5 w-3.5' />
                                    <span>{user.location}</span>
                                </div>
                                <div className='flex items-center gap-2 text-muted-foreground'>
                                    <Mail className='h-3.5 w-3.5' />
                                    <span>{user.email}</span>
                                </div>
                                <div className='flex items-center gap-2 text-muted-foreground'>
                                    <BookOpen className='h-3.5 w-3.5' />
                                    <span>{user.program}</span>
                                </div>
                                <div className='flex items-center gap-2 text-muted-foreground'>
                                    <CalendarDays className='h-3.5 w-3.5' />
                                    <span>{user.session}</span>
                                </div>
                                <div className='flex items-center gap-2 text-muted-foreground'>
                                    <Clock className='h-3.5 w-3.5' />
                                    <span>Joined {user.joinDate}</span>
                                </div>
                            </div>

                            {user.bio && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className='text-xs font-medium text-muted-foreground mb-1'>
                                            BIO
                                        </h4>
                                        <p className='text-sm'>{user.bio}</p>
                                    </div>
                                </>
                            )}

                            {user.skills && user.skills.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className='text-xs font-medium text-muted-foreground mb-2'>
                                            SKILLS
                                        </h4>
                                        <div className='flex flex-wrap gap-1.5'>
                                            {user.skills.map((skill) => (
                                                <Badge
                                                    key={skill}
                                                    variant='secondary'
                                                    className='text-xs'
                                                >
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer with actions */}
                        <div className='bg-muted/30 p-3 flex items-center justify-between'>
                            <Button
                                size='sm'
                                variant='outline'
                                className='h-8 text-xs'
                            >
                                <MessageSquare className='h-3.5 w-3.5 mr-1.5' />
                                Message
                            </Button>
                            <Button
                                size='sm'
                                variant='outline'
                                className='h-8 text-xs'
                            >
                                <ExternalLink className='h-3.5 w-3.5 mr-1.5' />
                                View Profile
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className='p-4 flex items-center justify-center h-20'>
                        <div className='animate-pulse flex space-x-4'>
                            <div className='rounded-full bg-muted h-10 w-10'></div>
                            <div className='flex-1 space-y-2 py-1'>
                                <div className='h-2 bg-muted rounded w-3/4'></div>
                                <div className='h-2 bg-muted rounded w-1/2'></div>
                            </div>
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
