import TechnicalTest from './_components/TechnicalTest';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Technical Test | BootcampsHub Portal',
    description:
        'Test your technical skills with our BootcampsHub technical test.',
};

const page = () => {
    return <TechnicalTest />;
};

export default page;
