'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { Paperclip, ArrowRight, Trash2, ArrowLeft } from 'lucide-react';
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

type PaymentMethod = 'paypal' | 'bank' | 'card' | 'custom' | null;

interface PaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
    const [amount, setAmount] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentDate = format(new Date(), 'MMM do, yyyy');

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setAttachedFiles([...attachedFiles, ...Array.from(e.target.files)]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
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
                                className='pl-7 bg-foreground'
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
                            placeholder='Write here...'
                            className='min-h-[100px] bg-foreground'
                        />
                    </div>

                    {/* File Attachment */}
                    <div>
                        <div className='flex justify-between items-center mb-2'>
                            <span className='text-sm font-medium'>
                                {attachedFiles.length > 0
                                    ? `Attached Files (${attachedFiles.length})`
                                    : ''}
                            </span>
                        </div>

                        {attachedFiles.length > 0 && (
                            <div className='space-y-2 mb-4'>
                                {attachedFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className='flex items-center justify-between border rounded-md p-2'
                                    >
                                        <div className='flex items-center gap-2'>
                                            <div className='bg-muted w-8 h-8 rounded flex items-center justify-center'>
                                                {/* Attachment SVG */}
                                                <svg
                                                    width='16'
                                                    height='16'
                                                    viewBox='0 0 24 24'
                                                    fill='none'
                                                    xmlns='http://www.w3.org/2000/svg'
                                                >
                                                    {/* ... SVG paths ... */}
                                                </svg>
                                            </div>
                                            <div>
                                                <div className='text-sm truncate max-w-[200px]'>
                                                    {file.name}
                                                </div>
                                                <div className='text-xs text-muted-foreground'>
                                                    {Math.round(
                                                        file.size / 1024,
                                                    )}{' '}
                                                    KB
                                                </div>
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
                                onChange={handleFileChange}
                                multiple
                            />
                        </div>
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
            buttons={
                <div className='border rounded-md px-3 py-1 text-sm'>
                    {currentDate}
                </div>
            }
            customFooter={
                <div className='p-5 bg-background'>
                    <Button
                        className='w-full bg-primary hover:bg-primary/90'
                        disabled={!selectedMethod || !amount}
                    >
                        Continue to Payment{' '}
                        <ArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                </div>
            }
        >
            {modalContent}
        </GlobalModal>
    );
}
