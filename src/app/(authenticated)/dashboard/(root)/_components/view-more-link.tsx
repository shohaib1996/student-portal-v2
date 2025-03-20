import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ViewMoreLinkProps {
    href: string;
}

export function ViewMoreLink({ href }: ViewMoreLinkProps) {
    return (
        <Link
            href={href}
            className='text-primary text-xs font-medium flex items-center'
        >
            <Button variant='default' className='text-xs'>
                View More
                <ArrowRight className='h-4 w-4' />
            </Button>
        </Link>
    );
}
