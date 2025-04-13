import { Metadata } from 'next';
import BootcampPage from './_components/BootcampPage';

export const metadata: Metadata = {
    title: 'Program | BootcampsHub',
    description: 'Continue learning to keep moving forward in the BootcampsHub',
};

const page = () => {
    return <BootcampPage />;
};

export default page;
