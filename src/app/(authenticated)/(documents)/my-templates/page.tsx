import MyTemplateComponent from './_components/my-template-component';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Templates | BootcampsHub Portal',
    description:
        'Browse and manage your saved templates for quick and easy use in BootcampsHub Portal',
};

export default function MyTemplatesPage() {
    return <MyTemplateComponent />;
}
