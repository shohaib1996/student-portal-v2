import React from 'react';
import OnlineCoursesPage from './_components/OnlineCoursesPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Enrollments | BootcampsHub Portal',
    description:
        'Learn, Grow, and Advance Your Career Online in BootcampsHub Portal.',
};

const page = () => {
    return (
        <>
            <OnlineCoursesPage />
        </>
    );
};

export default page;
