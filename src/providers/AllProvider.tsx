'use client';
import { Tooltip, TooltipProvider } from '@/components/ui/tooltip';
import WithAuth from '@/helper/WithAuth';

import React, { ReactNode } from 'react';

const AllProvider = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <WithAuth>
                <TooltipProvider>
                    <Tooltip>{children}</Tooltip>
                </TooltipProvider>
            </WithAuth>
        </>
    );
};

export default AllProvider;
