import { Metadata } from 'next';
import DashboardBody from './_components/dashboard-body';

export const metadata: Metadata = {
    title: 'Dashboard | BootcampsHub Portal',
    description:
        'Monitor your progress and activities in the Bootcamps Hub dashboard.',
};

const Dashboard = () => {
    return (
        <div>
            <DashboardBody />
        </div>
    );
};

export default Dashboard;
