import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSavePostApiMutation } from '@/redux/api/community/community';
import { useState } from 'react';
import { toast } from 'sonner';
import GlobalMarkDownEdit from '../global/Community/MarkDown/GlobalMarkDownEdit';

interface IReportPostProps {
    postTitle: string;
    postId: string;
    refetch: number;
    setRefetch: (value: number) => void;
    setOpenReport: (value: boolean) => void;
}

const ReportPost = ({
    postTitle,
    postId,
    refetch,
    setRefetch,
    setOpenReport,
}: IReportPostProps) => {
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [markDownContent, setMarkDownContent] = useState('');
    const [reportPost, { isLoading }] = useSavePostApiMutation();

    const handleReport = async () => {
        const payload = {
            post: postId,
            action: 'report',
            reportReason: selectedReason,
            note: markDownContent,
        };
        const toastId = toast.loading('Post is saving...');
        try {
            const response = await reportPost({ payload }).unwrap();
            if (response.success) {
                toast.success('Post saved successfully', { id: toastId });
                setOpenReport(false);
                setRefetch(refetch + 1);
            }
        } catch (error) {
            toast.error('Failed to create post');
        }
    };
    return (
        <div>
            <p className='mb-common font-semibold'>Post Title: {postTitle}</p>
            <RadioGroup
                className='space-y-common'
                onValueChange={(value) => setSelectedReason(value)}
                value={selectedReason}
            >
                <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='Spam or Scam' id='r1' />
                    <Label htmlFor='r1'>Spam or Scam</Label>
                </div>
                <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='Bullying or Harassment' id='r2' />
                    <Label htmlFor='r2'>Bullying or Harassment</Label>
                </div>
                <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='Impersonation' id='r3' />
                    <Label htmlFor='r3'>Impersonation</Label>
                </div>
                <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='Privacy Violation' id='r4' />
                    <Label htmlFor='r3'>Privacy Violation</Label>
                </div>
                <div className='flex items-center space-x-2'>
                    <RadioGroupItem
                        value='Hate Speech or Discrimination'
                        id='r5'
                    />
                    <Label htmlFor='r3'>Hate Speech or Discrimination</Label>
                </div>
                <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='Other' id='r6' />
                    <Label htmlFor='r3'>Other</Label>
                </div>
            </RadioGroup>
            <div className='mt-common'>
                <GlobalMarkDownEdit
                    value={markDownContent}
                    setValue={setMarkDownContent}
                    label='Please leave a note'
                />
            </div>
            <div className='flex w-full gap-common mt-common'>
                <Button onClick={handleReport} className='flex-1'>
                    {isLoading ? 'Reporting...' : 'Report'}
                </Button>
                <Button
                    onClick={() => setOpenReport(false)}
                    className='flex-1'
                    variant='danger_light'
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
};

export default ReportPost;
