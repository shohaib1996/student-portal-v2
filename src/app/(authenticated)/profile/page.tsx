import { Metadata } from 'next';
import MyProfileComponent from './_components/my-profile';

export const metadata: Metadata = {
    title: 'Profile | BootcampsHub Portal',
    description: 'This is the profile page of BootcampsHub Portal',
};

export default function MyProfilePage() {
    return (
        <div>
            <MyProfileComponent />
        </div>
    );
}
