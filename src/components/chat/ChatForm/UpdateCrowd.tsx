'use client';

import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { X, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAppDispatch } from '@/redux/hooks';
import { updateChats } from '@/redux/features/chatReducer';

interface AboutProps {
    opened: boolean;
    close: () => void;
    chatId?: string;
    initialData?: {
        name?: string;
        description?: string;
    };
}

interface FormData {
    groupName: string;
    description: string;
}

interface FormErrors {
    groupName?: string;
}

const About: React.FC<AboutProps> = ({
    opened,
    close,
    chatId,
    initialData,
}) => {
    const [formData, setFormData] = useState<FormData>({
        groupName: initialData?.name || '',
        description: initialData?.description || '',
    });

    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    // Redux dispatch
    const dispatch = useAppDispatch();

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user types
        if (formErrors[name as keyof FormErrors]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        if (!formData.groupName.trim()) {
            errors.groupName = 'This is a required field!';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !chatId) {
            return;
        }

        setIsLoading(true);

        try {
            // Make the API call directly
            const response = await fetch(`/chat/channel/update/${chatId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.groupName,
                    description: formData.description,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update crowd');
            }

            const data = await response.json();

            // Update Redux store with the updated chat
            dispatch(
                updateChats({
                    _id: chatId,
                    name: formData.groupName,
                    description: formData.description,
                    ...data.channel,
                }),
            );

            toast.success('Crowd updated successfully');
            close();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to update crowd',
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={opened} onOpenChange={(open) => !open && close()}>
            <DialogContent className='sm:max-w-[580px] p-0 bModalContent'>
                <DialogHeader className='px-6 py-4 border-b border-border bModalHeader'>
                    <div className='flex items-center justify-between'>
                        <DialogTitle className='text-xl font-medium bModalTitle'>
                            Update Crowd
                        </DialogTitle>
                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={close}
                            className='h-10 w-10 rounded-full bg-muted/20 hover:bg-muted/40 btn-close'
                        >
                            <X className='h-5 w-5 text-muted-foreground' />
                            <span className='sr-only'>Close</span>
                        </Button>
                    </div>
                </DialogHeader>

                <div className='p-6 bModalBody'>
                    <form
                        onSubmit={handleFormSubmit}
                        className='space-y-6 form-container'
                    >
                        <div className='space-y-2 input-wrapper'>
                            <Label
                                htmlFor='groupName'
                                className='text-base font-medium label'
                            >
                                Group Name *
                            </Label>
                            <Input
                                type='text'
                                name='groupName'
                                id='groupName'
                                value={formData.groupName}
                                onChange={handleInputChange}
                                className='textInput'
                                placeholder='Engineer group'
                            />
                            {formErrors.groupName && (
                                <span className='text-sm text-destructive error-input'>
                                    {formErrors.groupName}
                                </span>
                            )}
                        </div>

                        <div className='space-y-2 input-wrapper'>
                            <Label
                                htmlFor='description'
                                className='text-base font-medium label'
                            >
                                Group Description
                            </Label>
                            <Textarea
                                name='description'
                                id='description'
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder='Enter Crowd description'
                                rows={5}
                                className='resize-none'
                            />
                        </div>

                        <Button
                            type='submit'
                            disabled={isLoading}
                            className='w-full btn-fill'
                        >
                            {isLoading ? (
                                <Loader2 className='h-5 w-5 animate-spin mr-2' />
                            ) : null}
                            {isLoading ? 'Updating...' : 'Update'}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default About;
