'use client';
import { store } from '@/redux/store';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';

const ReduxProvider = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <>
            <Provider store={store}>{children}</Provider>
        </>
    );
};

export default ReduxProvider;
