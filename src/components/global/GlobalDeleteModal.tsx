// @typescript-eslint/no-unsafe-function-type
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Loader, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlobalDeleteModalProps {
    deleteFun: (_id: any) => Promise<any>; // Explicit function type
    _id: string;
    itemTitle?: string;
    loading: boolean;
    disable?: boolean;
    modalSubTitle?: string;
    modalTitle?: string;
    children?: React.ReactNode;
    className?: string;
    isButton?: boolean;
    customDelete?: () => void;
}

const GlobalDeleteModal = ({
    deleteFun,
    _id,
    itemTitle,
    loading,
    disable = false,
    modalSubTitle,
    children,
    customDelete,
    className,
    modalTitle,
    isButton = false,
}: GlobalDeleteModalProps) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleDelete = async () => {
        try {
            const res = customDelete ? customDelete() : await deleteFun(_id);

            if (res?.data?.success) {
                toast.success(`${itemTitle || 'Item'} deleted successfully!`);
                setOpen(false);
            }
        } catch (error) {
            toast.error(`Error deleting item: ${error}`);
            setOpen(false);
        }
    };

    return (
        <>
            {/* {open && <div className="fixed inset-0 bg-red-400/50 z-50" aria-hidden="true" />} */}
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                    {isButton
                        ? (children ?? (
                              <Button size={'icon'} variant={'delete_button'}>
                                  <Trash size={18} />
                              </Button>
                          ))
                        : (children ?? (
                              <div
                                  className={cn(
                                      ' text-danger flex gap-2 items-center cursor-pointer',
                                      className,
                                  )}
                              >
                                  <Trash size={18} />
                                  Delete
                              </div>
                          ))}
                </AlertDialogTrigger>
                <AlertDialogContent className='z-[99999]'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='text-center text-red'>
                            {modalTitle || 'Are you absolutely sure?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className='text-center'>
                            {modalSubTitle ||
                                'This action cannot be undone. This will permanently delete your item and remove your data from our servers.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className='flex w-full justify-center'>
                        <AlertDialogFooter>
                            <AlertDialogCancel className='bg-primary text-pure-white hover:bg-primary hover:text-pure-white'>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className='bg-danger/20 hover:bg-danger/25 text-danger '
                                onClick={handleDelete}
                            >
                                {loading ? (
                                    <Loader className='animate-spin' />
                                ) : (
                                    'Delete'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default GlobalDeleteModal;
