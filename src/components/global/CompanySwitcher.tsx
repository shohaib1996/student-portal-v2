import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { setActiveCompany } from '@/redux/features/comapnyReducer';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

const CompanySwitcher: React.FC = () => {
    const dispatch = useAppDispatch();

    // Fix the typo in "companies" and add type annotation
    const { activeCompany, companies } = useAppSelector((state) => ({
        activeCompany: state.company.activeCompany,
        companies: state.company.companies, // Fixed typo from "comapanies"
    }));

    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    const handleChange = (value: string) => {
        const selectedCompany = companies.find(
            (company) => company._id === value,
        );
        if (selectedCompany) {
            dispatch(setActiveCompany(selectedCompany));

            toast.success(`Switched to ${selectedCompany.name}`);

            setIsDialogOpen(false);
        }
    };

    return (
        <>
            <Button
                variant='outline'
                onClick={() => setIsDialogOpen(true)}
                className='flex items-center gap-2'
            >
                {activeCompany ? activeCompany.name : 'Select Company'}
                <ChevronDown className='h-4 w-4' />
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle>Switch Company</DialogTitle>
                    </DialogHeader>

                    <Select
                        onValueChange={handleChange}
                        defaultValue={activeCompany?._id}
                    >
                        <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select a company' />
                        </SelectTrigger>
                        <SelectContent>
                            {companies.map((company) => (
                                <SelectItem
                                    key={company._id}
                                    value={company._id}
                                >
                                    {company.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CompanySwitcher;
