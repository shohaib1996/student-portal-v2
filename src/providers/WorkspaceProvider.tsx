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

        return () => {
            unsubscribe();
        };
    }, [store]);

    useEffect(() => {
        if (!activeCompanyId) {
            setIsLoading(true);
        }

        instance
            .get('/organization/user-organizations')
            .then((res) => {
                dispatch(setCompanies(res.data.organizations || []));
                if (!activeCompanyId) {
                    // dispatch(setCompanySwitcher(true));
                }
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

    const handleClose = () => {
        dispatch(setCompanySwitcher(false));
        setIsSwitcherVisible(false);
    };

    const handleCompanySelect = async (companyId: string) => {
        dispatch(setActiveCompany(companyId as any));
        Cookies.set('activeCompany', companyId);
        dispatch(setCompanySwitcher(false));
        setIsSwitcherVisible(false);

        setTimeout(() => {
            window.location.reload();
        }, 1000);
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
            <Button
                variant='default'
                onClick={() => dispatch(setCompanySwitcher(true))}
            >
                Select Company/University
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

            <GlobalModal
                open={isSwitcherVisible}
                setOpen={setIsSwitcherVisible}
                title='Select Company/University'
                allowFullScreen={false}
            >
                {loading ? (
                    <div className='flex justify-center items-center py-8'>
                        <div className='flex flex-col items-center gap-2'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                            <p className='text-sm text-gray-500'>
                                Loading companies...
                            </p>
                        </div>
                    </div>
                ) : companies?.length > 0 ? (
                    <div className='divide-y'>
                        {companies.map((company) => (
                            <div
                                key={company._id}
                                className='py-4 flex justify-between items-center'
                            >
                                <div>
                                    <h3 className='font-medium'>
                                        {company.name}
                                    </h3>
                                    <p className='text-sm text-gray-500'>
                                        {company.description ||
                                            'No description available.'}
                                    </p>
                                </div>
                                <div>
                                    {activeCompanyId === company._id ? (
                                        <div className='flex items-center justify-center w-8 h-8 rounded-full bg-green-100'>
                                            <Check className='text-green-600 h-4 w-4' />
                                        </div>
                                    ) : (
                                        <Button
                                            variant='default'
                                            onClick={() =>
                                                handleCompanySelect(company._id)
                                            }
                                            className='rounded'
                                        >
                                            Select
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center py-8 text-center'>
                        <p className='text-gray-500'>
                            No companies/universities available.
                        </p>
                    </div>
                )}
            </GlobalModal>
        </>
    );
}

export default WorkspaceProvider;
