import React from 'react';
import MyDocumentsPage from './_components/MyDocumentsPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Documents | BootcampsHub Portal',
    description:
        'Resource Library: Access All Essential Documents of BootcampsHub Portal.',
};

const page = () => {
    return (
        <>
            <MyDocumentsPage />
        </>
    );
};

export default page;
