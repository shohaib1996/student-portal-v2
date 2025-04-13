import DiagramComponent from './_components/diagram-component';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Architecture Diagram | BootcampsHub Portal',
    description: 'Explore the architecture of BootcampsHub Portal.',
};

export default function ArchitectureDiagramPage() {
    return <DiagramComponent />;
}
