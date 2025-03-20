import GlobalHeader from '@/components/global/GlobalHeader';
import { Button } from '@/components/ui/button';
import AudioAndVideos from './_components/audio-and-videos';

export default function AudioVideoPage() {
    return (
        <div>
            <GlobalHeader
                title='Audio & Videos'
                subTitle='These audios and videos only shared with you'
                buttons={
                    <div className='flex items-center gap-2'>
                        <Button variant='outline' size='sm'>
                            Filters
                        </Button>
                    </div>
                }
            />
            <AudioAndVideos />
        </div>
    );
}
