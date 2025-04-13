import Community from '@/components/Community/Community';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Community | BootcampsHub Portal',
    description: 'Connect, Collaborate, and Grow Together in BootcampsHub',
};

const CommunityPage = () => {
    return (
        <>
            <Community />
        </>
    );
};

export default CommunityPage;
