import ProgramDetailsComp from './_components/ProgramDetailsComp';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Program | BootcampsHub Portal',
    description: 'Learn the best bootcamps and courses for your career growth',
};

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    return <ProgramDetailsComp slug={slug} />;
};

export default page;
