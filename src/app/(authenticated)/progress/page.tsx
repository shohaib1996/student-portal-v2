import React from 'react';
import ProgressComp from './_components/ProgressComp';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Progress | BootcampsHub Portal',
    description: 'Track Your Growth, One Step at a Time in the Bootcamps Hub',
};

const page = () => {
    return <ProgressComp />;
};

export default page;
