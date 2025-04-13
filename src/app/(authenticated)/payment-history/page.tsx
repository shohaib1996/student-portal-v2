import PaymentHistoryPage from './_components/PaymentHistoryPage';
import { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'Payment | BootcampsHub',
    description: 'Track and Manage Your Payments Easily',
};

const page = () => {
    return (
        <>
            <PaymentHistoryPage />
        </>
    );
};

export default page;
