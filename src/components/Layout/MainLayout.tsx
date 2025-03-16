'use client';
import React, { ReactNode } from 'react';
import { AppSidebar } from '../shared/AppSidebar';
import SelectActiveCompany from '../shared/SelectActiveCompany';
import Cookies from 'js-cookie';

const MainLayout = ({ children }: { children: ReactNode }) => {
    const activeCompany = Cookies.get('activeCompany');
    return (
        <>
            {activeCompany ? (
                <>
                    <AppSidebar />
                    <main className='mx-auto max-w-[1300px] p-common pt-0 md:p-common 2xl:p-0 2xl:pb-common'>
                        {children}
                    </main>
                </>
            ) : (
                <SelectActiveCompany />
            )}
        </>
    );
};

export default MainLayout;
