'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import { format } from 'date-fns';
import {
    Paperclip,
    ArrowRight,
    Trash2,
    ArrowLeft,
    Calendar1,
    CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import GlobalModal from '@/components/global/GlobalModal';
import {
    BankTransfer,
    Card,
    Custom,
    Paypal,
} from '@/components/svgs/payment/payment-modal';
import { instance } from '@/lib/axios/axiosInstance';
import Image from 'next/image';
import LoadingSpinner from '@/components/global/Community/LoadingSpinner/LoadingSpinner';
import { toast } from 'sonner';
import { useAddPaymentApiMutation } from '@/redux/api/payment-history/paymentHistory';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import dayjs from 'dayjs';

type PaymentMethod = 'paypal' | 'bank' | 'card' | 'custom' | null;

interface PaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
    const [amount, setAmount] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadFiles, setUploadFiles] = useState<string[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [note, setNote] = useState('');
    const [current, setCurrent] = useState<Date | undefined>(new Date());
    const [addPayment, { isLoading }] = useAddPaymentApiMutation();

    const paymentMethods = [
        {
            id: 'paypal',
            name: 'PayPal',
            borderColor: 'border-primary',
            bgColor: 'bg-[#e6ebfa]',
            svg: Paypal,
        },
        {
            id: 'bank',
            name: 'Bank Transfer',
            borderColor: 'border-primary',
            bgColor: 'bg-[#e6ebfa]',
            svg: BankTransfer,
        },
        {
            id: 'card',
            name: 'Debit or Credit Card',
            borderColor: 'border-primary',
            bgColor: 'bg-[#e6ebfa]',
            svg: Card,
        },
        {
            id: 'custom',
            name: 'Custom',
            borderColor: 'border-primary',
            bgColor: 'bg-[#e6ebfa]',
            svg: Custom,
        },
    ];

    const handleMethodSelect = (method: PaymentMethod) => {
        setSelectedMethod(method);
    };

    const handleUpload = (files: File) => {
        if (files) {
            setUploadingFiles(true);
            const formData = new FormData();
            formData.append('file', files);
            instance
                .post('/settings/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                .then((res) => {
                    console.log(res);
                    setUploadFiles((prev) => [...prev, res.data.url]);
                    setUploadingFiles(false);
                })
                .catch((err) => {
                    setUploadingFiles(false);
                });
        }
    };

    const handleRemoveFile = (index: number) => {
        setUploadFiles(uploadFiles.filter((_, i) => i !== index));
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const getFileNameFromUrl = (url: string): string => {
        const parts = url.split('/');
        const fileNameWithTimestamp = parts[parts.length - 1];
        const fileName = fileNameWithTimestamp.split('-')[1];
        return fileName;
    };

    const submitPayment = () => {
        if (selectedMethod) {
            const data = {
                method: selectedMethod,
                amount: Number(amount),
                attachment: uploadFiles[0],
                note: note,
                date: current,
            };
            addPayment({ payload: data })
                .unwrap()
                .then((res) => {
                    console.log(res);
                    onOpenChange(false);
                    toast.success('Payment added successfully!');
                    setSelectedMethod(null);
                    setAmount('');
                    setUploadFiles([]);
                    setNote('');
                })
                .catch((err) => {
                    console.error(err);
                    onOpenChange(false);
                    toast.error(err?.message || 'Something went wrong!');
                    setSelectedMethod(null);
                    setAmount('');
                    setUploadFiles([]);
                    setNote('');
                });
        }
    };

    // Content that was previously in DialogContent
    const modalContent = (
        <div className='flex flex-col h-full py-3'>
            {/* Body content */}
            <div className='overflow-y-auto flex-1'>
                <div className='space-y-3'>
                    {/* Payment Method Selection */}
                    <div>
                        <label className='block text-sm font-medium mb-2'>
                            Method <span className='text-[#f34141]'>*</span>
                        </label>
                        <div className='grid grid-cols-2 gap-2'>
                            {paymentMethods.map(
                                ({
                                    id,
                                    borderColor,
                                    bgColor,
                                    svg: SvgComponent,
                                    name,
                                }) => (
                                    <div
                                        key={id}
                                        className={cn(
                                            'border rounded-md p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors bg-foreground',
                                            selectedMethod === id &&
                                                `${borderColor} ${bgColor}`,
                                        )}
                                        onClick={() =>
                                            handleMethodSelect(
                                                id as PaymentMethod,
                                            )
                                        }
                                    >
                                        <div className='w-10 h-10 flex items-center justify-center'>
                                            <SvgComponent
                                                isActive={selectedMethod === id}
                                            />
                                        </div>
                                        <span
                                            className={cn(
                                                'text-sm',
                                                selectedMethod === id &&
                                                    'text-primary font-semibold',
                                            )}
                                        >
                                            {name}
                                        </span>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>

                    {/* Bank Transfer Details */}
                    {selectedMethod === 'bank' && (
                        <div className='space-y-4 border rounded-md p-4 bg-foreground'>
                            <h3 className='font-medium'>
                                Bank Transfer Information
                            </h3>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm mb-1'>
                                        Bank Name:
                                    </label>
                                    <Input defaultValue='IFIC Bank' />
                                </div>
                                <div>
                                    <label className='block text-sm mb-1'>
                                        Account Name:
                                    </label>
                                    <Input defaultValue='ACME Corporation' />
                                </div>
                                <div>
                                    <label className='block text-sm mb-1'>
                                        Account Number:
                                    </label>
                                    <Input defaultValue='1234567890' />
                                </div>
                                <div>
                                    <label className='block text-sm mb-1'>
                                        Routing Number:
                                    </label>
                                    <Input defaultValue='987654321' />
                                </div>
                            </div>
                            <div>
                                <label className='block text-sm mb-1'>
                                    Reference:
                                </label>
                                <div className='text-sm text-muted-foreground'>
                                    Include your name and invoice number
                                </div>
                                <div className='text-xs text-muted-foreground mt-1'>
                                    Please allow 2-3 business days for the
                                    transfer to be processed.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Amount */}
                    <div>
                        <label className='block text-sm font-medium mb-2'>
                            Amount <span className='text-[#f34141]'>*</span>
                        </label>
                        <div className='relative'>
                            <span className='absolute left-3 top-1/2 -translate-y-1/2'>
                                $
                            </span>
                            <Input
                                className='pl-6 text-dark-gray bg-foreground focus:border focus:border-border-primary-light focus:ring-0'
                                placeholder='0.00'
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Note */}
                    <div>
                        <label className='block text-sm font-medium mb-2'>
                            Note
                        </label>
                        <Textarea
                            placeholder='Write details note here...'
                            onChange={(e) => setNote(e.target.value)}
                            value={note}
                            className='min-h-[100px] bg-foreground text-dark-gray focus:border focus:border-border-primary-light focus:ring-0 focus-visible:ring-0'
                        />
                    </div>

                    {/* File Attachment */}
                    <div>
                        <div className='flex justify-between items-center mb-2'>
                            <span className='text-sm font-medium'>
                                {uploadFiles.length > 0
                                    ? `Attached Files (${uploadFiles.length})`
                                    : ''}
                            </span>
                        </div>

                        {uploadFiles.length > 0 && (
                            <div className='space-y-2 mb-4'>
                                {uploadFiles.map((url, index) => (
                                    <div
                                        key={index}
                                        className='flex items-center justify-between border rounded-md p-2'
                                    >
                                        <div className='flex items-center gap-2'>
                                            <div className='bg-muted w-8 h-8 rounded flex items-center justify-center'>
                                                <Image
                                                    src={url}
                                                    width={32}
                                                    height={80}
                                                    alt='Payment Proves'
                                                ></Image>
                                            </div>
                                            <div>
                                                <div className='text-sm truncate max-w-[200px]'>
                                                    {getFileNameFromUrl(url)}
                                                </div>
                                                {/* <div className='text-xs text-muted-foreground'>
                                                    {Math.round(
                                                        file.size / 1024,
                                                    )}{' '}
                                                    KB
                                                </div> */}
                                            </div>
                                        </div>
                                        <button
                                            className='text-[#f34141] hover:bg-red-50 p-1 rounded-full'
                                            onClick={() =>
                                                handleRemoveFile(index)
                                            }
                                        >
                                            <Trash2 className='h-4 w-4' />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {uploadingFiles ? (
                            <div className='flex items-center justify-center space-x-2 text-gray text-sm'>
                                <LoadingSpinner size={20} /> Please wait,
                                Uploading...
                            </div>
                        ) : (
                            <div
                                className='border border-dashed rounded-md p-4 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors'
                                onClick={triggerFileInput}
                            >
                                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                    <Paperclip className='h-4 w-4' />
                                    <span>Attach or drag & drop</span>
                                    <span className='text-xs'>
                                        .JPG, .PNG, .PDF, .DOC, .XLSX, .MP4
                                    </span>
                                </div>
                                <input
                                    type='file'
                                    ref={fileInputRef}
                                    className='hidden'
                                    onChange={(e) =>
                                        e.target.files &&
                                        handleUpload(e.target.files[0])
                                    }
                                    multiple
                                    disabled={uploadingFiles}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <GlobalModal
            className='bg-background'
            open={open}
            setOpen={onOpenChange}
            title={
                <div>
                    <Button
                        variant='ghost'
                        className='p-0'
                        onClick={() => onOpenChange(false)}
                    >
                        <ArrowLeft className='h-4 w-4' />
                    </Button>
                    <span className='ml-1'>Add Payment</span>
                </div>
            }
            subTitle='Fill out the form to add new payment'
            customFooter={
                <div className='p-5 bg-background'>
                    <Button
                        className='w-full bg-primary hover:bg-primary/90'
                        onClick={submitPayment}
                        disabled={!selectedMethod || !amount || isLoading}
                    >
                        Continue to Payment{' '}
                        <ArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                </div>
            }
            buttons={
                <div className='bg-foreground border rounded-md px-3 py-1 text-sm flex items-center gap-1'>
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className='flex items-center gap-2 cursor-pointer'>
                                <CalendarIcon size={16} />{' '}
                                {dayjs(current).format('MMM D, YYYY')}
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0 z-[999]'>
                            <Calendar
                                mode='single'
                                selected={current}
                                onSelect={(date) => setCurrent(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            }
        >
            {modalContent}
        </GlobalModal>
    );
}
