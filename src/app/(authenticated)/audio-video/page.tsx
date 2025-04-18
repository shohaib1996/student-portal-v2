import AudioAndVideos from './_components/audio-and-videos';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Audio & Videos | BootcampsHub Portal',
    description: 'These audios and videos only shared with you',
};

export default function AudioVideoPage() {
    return (
        <div>
            <AudioAndVideos />
        </div>
    );
}
