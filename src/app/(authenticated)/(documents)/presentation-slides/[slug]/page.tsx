import SlideComponent from '@/components/slides/SlideComponent';

const SlidPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const slug = (await params).slug;

    // return <SlideComponent _id={slug} />;
    return <SlideComponent id={slug} />;
};

export default SlidPage;
