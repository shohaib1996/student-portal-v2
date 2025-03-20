'use client';

import type React from 'react';
import { useState, useCallback } from 'react';
import { RadioGroup } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircleWarning } from 'lucide-react';
import { toast } from 'sonner';
import GlobalDialog from '@/components/global/GlobalDialogModal/GlobalDialog';
import { cn } from '@/lib/utils';

interface ReportModalProps {
    opened: boolean;
    close: () => void;
    onSubmit: (reason: string, details?: string) => void;
    isLoading?: boolean;
}

const ReportModal: React.FC<ReportModalProps> = ({
    opened,
    close,
    onSubmit,
    isLoading = false,
}) => {
    const [reason, setReason] = useState<string>('');
    const [details, setDetails] = useState<string>('');

    const handleSubmit = useCallback(() => {
        if (!reason) {
            toast.error('Please select a reason for reporting');
            return;
        }

        if (reason === 'Others' && !details.trim()) {
            toast.error('Please provide details for your report');
            return;
        }

        onSubmit(reason, reason === 'Others' ? details : undefined);
    }, [reason, details, onSubmit]);

    const modalClose = useCallback(() => {
        close();
        // Reset form when closing
        setReason('');
        setDetails('');
    }, [close]);

    // Custom radio button component
    const CustomRadio = ({ selected }: { selected: boolean }) => (
        <div
            className={cn(
                'w-5 h-5 rounded-full border flex items-center justify-center transition-colors',
                selected ? 'border-primary' : 'border-gray',
            )}
        >
            {selected && <div className='w-3 h-3 rounded-full bg-primary' />}
        </div>
    );

    // Direct click handlers for each option
    const handleOptionClick = useCallback((value: string) => {
        setReason(value);
    }, []);

    return (
        <GlobalDialog
            open={opened}
            setOpen={(open: boolean) => !open && modalClose()}
            className='sm:max-w-[500px]'
            allowFullScreen={false}
            title='Report'
            subTitle='Select a valid reason for reporting'
            buttons={
                <Button
                    variant='default'
                    size='sm'
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className=''
                >
                    <MessageCircleWarning className='h-4 w-4' />
                    Report
                </Button>
            }
        >
            <div className='space-y-2'>
                <RadioGroup
                    value={reason}
                    onValueChange={setReason}
                    className=''
                >
                    {/* Harassment option */}
                    <div
                        className={cn(
                            'flex items-center space-x-3 border rounded-md p-2 cursor-pointer transition-colors',
                            reason === 'Harassment'
                                ? 'border-blue-500/30 bg-primary-light'
                                : 'border hover:border-blue-500/30 bg-foreground hover:bg-primary-light',
                        )}
                        onClick={() => handleOptionClick('Harassment')}
                    >
                        <CustomRadio selected={reason === 'Harassment'} />
                        <span className='text-gray'>Harassment</span>
                    </div>

                    {/* Sharing inappropriate content option */}
                    <div
                        className={cn(
                            'flex items-center space-x-3 border rounded-md p-2 cursor-pointer transition-colors',
                            reason === 'Sharing inappropriate content'
                                ? 'border-blue-500/30 bg-primary-light'
                                : 'border hover:border-blue-500/30 bg-foreground hover:bg-primary-light',
                        )}
                        onClick={() =>
                            handleOptionClick('Sharing inappropriate content')
                        }
                    >
                        <CustomRadio
                            selected={
                                reason === 'Sharing inappropriate content'
                            }
                        />
                        <span className='text-gray'>
                            Sharing inappropriate content
                        </span>
                    </div>

                    {/* Hate speech option */}
                    <div
                        className={cn(
                            'flex items-center space-x-3 border rounded-md p-2 cursor-pointer transition-colors',
                            reason === 'Hate speech'
                                ? 'border-blue-500/30 bg-primary-light'
                                : 'border hover:border-blue-500/30 bg-foreground hover:bg-primary-light',
                        )}
                        onClick={() => handleOptionClick('Hate speech')}
                    >
                        <CustomRadio selected={reason === 'Hate speech'} />
                        <span className='text-gray'>Hate speech</span>
                    </div>

                    {/* Scams option */}
                    <div
                        className={cn(
                            'flex items-center space-x-3 border rounded-md p-2 cursor-pointer transition-colors',
                            reason === 'Scams'
                                ? 'border-blue-500/30 bg-primary-light'
                                : 'border hover:border-blue-500/30 bg-foreground hover:bg-primary-light',
                        )}
                        onClick={() => handleOptionClick('Scams')}
                    >
                        <CustomRadio selected={reason === 'Scams'} />
                        <span className='text-gray'>Scams</span>
                    </div>

                    {/* Others option */}
                    <div
                        className={cn(
                            'border rounded-md p-3 transition-colors',
                            reason === 'Others'
                                ? 'border-blue-500/30 bg-primary-light'
                                : 'border hover:border-blue-500/30 bg-foreground hover:bg-primary-light',
                        )}
                    >
                        <div
                            className='flex items-center space-x-3 cursor-pointer'
                            onClick={() => handleOptionClick('Others')}
                        >
                            <CustomRadio selected={reason === 'Others'} />
                            <span className='text-gray'>Others</span>
                        </div>

                        {reason === 'Others' && (
                            <Textarea
                                placeholder='Write details here...'
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                className='mt-1 min-h-[100px] bg-background w-full ml-0 focus:border'
                                onClick={(e) => e.stopPropagation()}
                            />
                        )}
                    </div>
                </RadioGroup>
            </div>
        </GlobalDialog>
    );
};

export default ReportModal;
