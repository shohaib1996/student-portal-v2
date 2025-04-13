import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Documents and Labs| BootcampsHub Portal',
    description: 'View your documents and labs with ease',
};

function layout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}

export default layout;
