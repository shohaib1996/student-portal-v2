import React from 'react';
import LeaderBoard from './_components/LeaderBoard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Leaderboard | BootcampsHub Portal',
    description: 'Track Your Progress, Reach the Top in the Bootcamps Hub',
};

const page = () => {
    return (
        <>
            <LeaderBoard />
        </>
    );
};

export default page;
