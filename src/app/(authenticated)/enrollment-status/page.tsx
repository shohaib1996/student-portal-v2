'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import storage from '@/utils/storage';
import { setEnrollment } from '@/redux/features/auth/authReducer';
import SwitchModal from '@/components/shared/SwitchModal';

// Define TypeScript interfaces
interface Enrollment {
    id: string;
    // Add other enrollment properties as needed
}

interface RootState {
    auth: {
        myEnrollments: Enrollment[];
    };
}

export default function EnrollmentStatus() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { myEnrollments } = useSelector((state: RootState) => state.auth);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [active, setActive] = useState<Enrollment | null>(null);

    const getActive = async () => {
        if (typeof window !== 'undefined') {
            // Only run in the browser
            const activeEnrollment = await storage.getItem('active_enrolment');
            if (activeEnrollment) {
                setActive(activeEnrollment);
            }
        }
    };

    useEffect(() => {
        setIsModalOpen(true);
    }, []);

    useEffect(() => {
        getActive();
    }, [myEnrollments]);

    const handleSwitch = async (enrollment: Enrollment) => {
        dispatch(setEnrollment(enrollment));
        await storage.setItem('active_enrolment', enrollment);
        getActive();

        toast.success('Successfully switched enrollment');

        // Using Next.js 15 navigation approach
        router.push('/dashboard/program');
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className='min-h-screen bg-background'>
            <SwitchModal opened={isModalOpen} handleClose={closeModal} />
        </div>
    );
}
