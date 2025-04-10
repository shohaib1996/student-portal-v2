'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
// import {
//     setActiveCompany,
//     setCompanies,
//     setCompanySwitcher,
// } from '../redux/features/comapnyReducer';
import { Check } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import GlobalModal from '@/components/global/GlobalModal';
import { toast } from 'sonner';
import { instance } from '@/lib/axios/axiosInstance';
import CombinedSelectionModal from '@/components/global/SelectModal/combined-selection-modal';
import { useMyProgramQuery } from '@/redux/api/myprogram/myprogramApi';
import { openModal } from '@/redux/features/selectionModalSlice';

// Define interfaces for TypeScript
interface Company {
    _id: string;
    name: string;
    description?: string;
}

interface CompanyState {
    companies: Company[];
    companySwitcher: boolean;
    loading: boolean;
    activeCompany: string | null;
}

interface RootState {
    company: CompanyState;
}

interface WorkspaceProviderProps {
    children: ReactNode;
}

function WorkspaceProvider({ children }: WorkspaceProviderProps) {
    const dispatch = useDispatch();
    //  const { data, isLoading, isError, refetch } = useMyProgramQuery({});

    const [isLoading, setIsLoading] = useState<boolean>(false);
    // Set initial state to true to open modal automatically

    const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);

    useEffect(() => {
        // Check if there's an active company on mount
        const activeCompanyFromCookie = Cookies.get('activeCompany');
        const activeEnrollmentFromCookie = Cookies.get('activeEnrolment');

        if (!activeCompanyFromCookie || !activeEnrollmentFromCookie) {
            dispatch(openModal('course'));
        } else {
            setActiveCompanyId(activeCompanyFromCookie);
        }

        // const unsubscribe = store.subscribe(async () => {
        //     const state = store.getState() as RootState;
        //     const { companySwitcher, activeCompany } = state.company;
        //     // const { myEnrollments } = state.auth;

        //     // console.log('myEnrollments', myEnrollments);

        //     setIsSwitcherVisible(companySwitcher);
        //     setActiveCompanyId(Cookies.get('activeCompany') || null);
        //     setEnrollment(Cookies.get('active_enrolment') || null);

        // });

        // return () => unsubscribe();
    }, []);

    // console.log('activeCompanyId', activeCompanyId);

    const EmptyState = () => (
        <div className='flex flex-col items-center justify-center p-8 text-center'>
            <div className='mb-4 text-gray-400'>
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='64'
                    height='64'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <rect
                        x='3'
                        y='3'
                        width='18'
                        height='18'
                        rx='2'
                        ry='2'
                    ></rect>
                    <line x1='3' y1='9' x2='21' y2='9'></line>
                    <line x1='9' y1='21' x2='9' y2='9'></line>
                </svg>
            </div>
            <h3 className='mb-1 text-lg font-medium'>No Enrollment found</h3>
            <p className='mb-4 text-sm text-gray-500'>
                Please select a program to get started.
            </p>
            <Button
                variant='default'
                onClick={() => {
                    dispatch(openModal('course'));
                }}
            >
                Select Program
            </Button>
        </div>
    );

    return (
        <>
            {isLoading ? (
                <Card className='w-full'>
                    <CardContent className='p-6'>
                        <div className='space-y-2'>
                            <Skeleton className='h-4 w-full' />
                            <Skeleton className='h-4 w-2/3' />
                            <Skeleton className='h-4 w-1/2' />
                        </div>
                    </CardContent>
                </Card>
            ) : activeCompanyId ? (
                children
            ) : (
                <EmptyState />
            )}

            <CombinedSelectionModal />
        </>
    );
}

export default WorkspaceProvider;
