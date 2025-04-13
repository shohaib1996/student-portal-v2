import PresentationComponents from './_components/presentation-component';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Presentations/Slides | BootcampsHub Portal',
    description: 'View and manage your presentations of BootcampsHub Portal',
};

export default function PresentationSlidesPage() {
    return <PresentationComponents />;
}
