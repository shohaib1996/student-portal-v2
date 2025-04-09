'use client';

import { useState, useEffect } from 'react'; // Add useEffect
import { useDispatch, useSelector } from 'react-redux';
import { X, ArrowRight, Check, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import GlobalModal from '@/components/global/GlobalModal'; // Adjust path as needed
import Cookies from 'js-cookie';
import { RootState } from '@/redux/store';
import {
    setActiveCompany,
    setCompanySwitcher,
} from '@/redux/features/comapnyReducer';

interface Company {
    _id: string;
    name: string;
    description?: string;
    image?: string;
    status?: 'active' | 'pending' | 'inactive';
    date?: string;
    time?: string;
}

interface UniversitySelectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect?: (company: Company) => void;
}

export function UniversitySelectModal({
    open,
    onOpenChange,
    onSelect,
}: UniversitySelectModalProps) {
    const dispatch = useDispatch();
    const { companies } = useSelector((state: RootState) => state.company);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
        null,
    ); // Initialize as null
    const [setAsDefault, setSetAsDefault] = useState(false);

    // Set initial selectedCompanyId based on cookies when the modal opens
    useEffect(() => {
        if (open) {
            const activeCompanyFromCookies = Cookies.get('activeCompany');
            if (activeCompanyFromCookies) {
                // Check if the company ID from cookies exists in the companies list
                const matchingCompany = companies.find(
                    (company) => company._id === activeCompanyFromCookies,
                );
                if (matchingCompany) {
                    setSelectedCompanyId(activeCompanyFromCookies);
                } else {
                    setSelectedCompanyId(null); // Reset if no match
                }
            } else {
                setSelectedCompanyId(null); // Reset if no cookie
            }
        }
    }, [open, companies]);

    const handleSelect = (id: string) => {
        setSelectedCompanyId(id);
    };

    const handleGoToProgram = () => {
        const selected = companies.find(
            (company) => company._id === selectedCompanyId,
        );
        if (selected) {
            dispatch(setActiveCompany(selected._id));
            Cookies.set('activeCompany', selected._id); // Persist selection
            if (onSelect) {
                onSelect(selected as Company);
            }
            dispatch(setCompanySwitcher(false));
            onOpenChange(false);
            setTimeout(() => window.location.reload(), 1000); // Match WorkspaceProvider behavior
        }
    };

    const filteredCompanies = companies.filter((company) =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <GlobalModal
            open={open}
            setOpen={onOpenChange}
            title='Select Company/University'
            subTitle='Select a university or organization to continue your journey'
            allowFullScreen={true}
            className='bg-background'
        >
            <div className='space-y-6 py-3'>
                <div className='relative'>
                    <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                        <svg
                            className='w-4 h-4 text-gray'
                            aria-hidden='true'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 20 20'
                        >
                            <path
                                stroke='currentColor'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z'
                            />
                        </svg>
                    </div>
                    <Input
                        className='pl-10 bg-foreground'
                        placeholder='Search companies...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className='space-y-3 max-h-[400px] overflow-y-auto pr-1'>
                    {filteredCompanies.map((company) => (
                        <div
                            key={company._id}
                            className={cn(
                                'border rounded-lg p-3 flex gap-3 bg-foreground',
                                selectedCompanyId === company._id &&
                                    'border-primary',
                            )}
                        >
                            <div className='flex-shrink-0'>
                                <Image
                                    src={
                                        company.image ||
                                        '/images/university-thumbnail.png'
                                    }
                                    alt={company.name}
                                    width={80}
                                    height={80}
                                    className='rounded-md object-cover'
                                />
                            </div>
                            <div className='flex-1 min-w-0'>
                                <div className='flex items-center gap-2'>
                                    <h3 className='text-sm font-medium'>
                                        {company.name}
                                    </h3>
                                    {company.status === 'active' && (
                                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800'>
                                            <Check className='w-3 h-3 mr-1' />{' '}
                                            Active
                                        </span>
                                    )}
                                    {company.status === 'pending' && (
                                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800'>
                                            <svg
                                                className='w-3 h-3 mr-1'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                            >
                                                <path
                                                    d='M12 8V12'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                />
                                                <path
                                                    d='M12 16V16.01'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                />
                                                <path
                                                    d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                />
                                            </svg>
                                            Pending
                                        </span>
                                    )}
                                    {company.status === 'inactive' && (
                                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800'>
                                            <X className='w-3 h-3 mr-1' />{' '}
                                            Inactive
                                        </span>
                                    )}
                                    {company.status === undefined && (
                                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800'>
                                            <X className='w-3 h-3 mr-1' />{' '}
                                            undefined
                                        </span>
                                    )}
                                </div>
                                <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                                    {company.description ||
                                        'No description available.'}
                                </p>
                                <div className='flex items-center mt-2 text-xs text-muted-foreground gap-1'>
                                    <CalendarDays className='h-4 w-4' />
                                    <p>{company.date ?? 'Dec 16, 1971'}</p>
                                    <span>|</span>
                                    <p>{company.time ?? '12:12AM'}</p>
                                </div>
                            </div>
                            <div className='flex items-center'>
                                {selectedCompanyId === company._id ? (
                                    <div className='px-4 py-1.5 rounded bg-[#e6ebfa] text-[#0736d1] text-sm font-medium flex items-center'>
                                        <Check className='w-4 h-4 mr-1' />{' '}
                                        Selected
                                    </div>
                                ) : (
                                    <Button
                                        variant='outline'
                                        className={cn(
                                            'px-4 py-1.5 h-auto text-sm',
                                            'bg-[#0736d1] text-white hover:bg-[#0736d1]/90',
                                        )}
                                        onClick={() =>
                                            handleSelect(company._id)
                                        }
                                    >
                                        Select
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className='flex items-center space-x-2'>
                    <Checkbox
                        id='default'
                        checked={setAsDefault}
                        onCheckedChange={(checked) =>
                            setSetAsDefault(checked as boolean)
                        }
                    />
                    <label
                        htmlFor='default'
                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                    >
                        Set this selected company as the default
                    </label>
                </div>

                <Button
                    className='w-full bg-[#0736d1] hover:bg-[#0736d1]/90'
                    onClick={handleGoToProgram}
                    disabled={!selectedCompanyId}
                >
                    Go to Program <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
            </div>
        </GlobalModal>
    );
}
