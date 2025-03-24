import ProgramDetailsComp from '../_components/ProgramDetailsComp';

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    return <ProgramDetailsComp slug={slug} />;
};

export default page;
