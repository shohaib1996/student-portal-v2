'use client';

import DiagramComponent from '@/components/global/diagram/diagram-component';
import { GlobalCommentsSection } from '@/components/global/GlobalCommentSection';
import { Button } from '@/components/ui/button';
import { useGetMyDiagramQuery } from '@/redux/api/diagram/diagramApi';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const DiagramPreviewComponent = () => {
    const params = useParams();
    const { data, isLoading, error, isFetching } = useGetMyDiagramQuery({
        page: 1,
        limit: 10,
    });

    if (isLoading) {
        return <div>pleaes wait...</div>;
    }

    if (error) {
        return <div>something went wrong!</div>;
    }

    const currentId = params.id;

    const diagram = data?.diagrams?.find((item) => item._id === currentId);

    return (
        <div>
            <div className='flex items-center gap-1 mb-3 border-b pb-2'>
                <Link href='/architecture-diagram'>
                    <Button variant='ghost'>
                        <ArrowLeft />
                    </Button>
                </Link>
                <span>{diagram?.title}</span>
            </div>
            <DiagramComponent
                height='720px'
                diagram={diagram?.attachments as string[]}
                viewMode={false}
            />
            <div className='p-4'>
                <GlobalCommentsSection />
            </div>
        </div>
    );
};

export default DiagramPreviewComponent;
