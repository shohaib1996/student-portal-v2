'use client';
import React, { useEffect, useState, ReactNode } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import {
    setActiveCompany,
    setCompanies,
    setCompanySwitcher,
} from '../redux/features/comapnyReducer';
import { Check } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import GlobalModal from '@/components/global/GlobalModal';
import { toast } from 'sonner';
import { instance } from '@/lib/axios/axiosInstance';
import { UniversitySelectModal } from '@/components/global/SelectModal/university-select-modal';
import UniversitySectionOpenButton from '@/components/global/SelectModal/buttons/university-section-open-button';

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
    const { companies, companySwitcher, loading } = useSelector(
        (state: RootState) => state.company,
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSwitcherVisible, setIsSwitcherVisible] = useState<boolean>(false);
    const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
    const store = useStore();

    useEffect(() => {
        const unsubscribe = store.subscribe(async () => {
            const state = store.getState() as RootState;
            const { companySwitcher, activeCompany } = state.company;
            setIsSwitcherVisible(companySwitcher);
            setActiveCompanyId(Cookies.get('activeCompany') || null);
        });

        return () => unsubscribe();
    }, [store]);

    useEffect(() => {
        if (!activeCompanyId) {
            setIsLoading(true);
        }

        instance
            .get('/organization/user-organizations')
            .then((res) => {
                dispatch(setCompanies(res.data.organizations || []));
                setIsLoading(false);
            })
            .catch((err) => {
                setIsLoading(false);
                toast.error(
                    err?.response?.data?.error ||
                        'Failed to load organizations',
                );
            });
    }, [activeCompanyId, dispatch]);

    const handleCompanySelect = async (companyId: string) => {
        dispatch(setActiveCompany(companyId as any));
        Cookies.set('activeCompany', companyId);
        dispatch(setCompanySwitcher(false));
        setIsSwitcherVisible(false);
        setTimeout(() => window.location.reload(), 1000);
    };

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
            <h3 className='mb-1 text-lg font-medium'>No Company Selected</h3>
            <p className='mb-4 text-sm text-gray-500'>
                Please select a company/university to continue.
            </p>
            {/* <Button
                variant='default'
                onClick={() => dispatch(setCompanySwitcher(true))}
            >
                Select Company/University
            </Button> */}
            <UniversitySectionOpenButton />
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

            {/* <UniversitySelectModal
                open={isSwitcherVisible}
                onOpenChange={(open) => {
                    setIsSwitcherVisible(open);
                    dispatch(setCompanySwitcher(open));
                }}
                onSelect={(company) => handleCompanySelect(company._id)}
            /> */}
        </>
    );
}

export default WorkspaceProvider;
