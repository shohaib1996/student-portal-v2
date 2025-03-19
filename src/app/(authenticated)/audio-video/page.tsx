import { GlobalHeader } from '@/components/global/global-header';
import AudioVideos from './_components/AudioVideos';
import { Button } from '@/components/ui/button';

export default function AudioVideoPage() {
    return (
        <div>
            <GlobalHeader
                title='Audio & Videos'
                subtitle='These audios and videos only shared with you'
            >
                <div className='flex items-center gap-2'>
                    <Button variant='outline' size='sm'>
                        Filters
                    </Button>
                </div>
            </GlobalHeader>
            <AudioVideos />
        </div>
    );
}
