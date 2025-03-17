'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import storage from '@/utils/storage';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { setEnrollment } from '@/redux/features/auth/authReducer';
import GlobalModal from '../global/GlobalModal';
import { useAppSelector } from '@/redux/hooks';

interface Enrollment {
    _id: string;
    status: string;
    program: {
        title: string;
        instructor: {
            name: string;
            image: string;
        };
    };
    session: {
        name: string;
    };
    organization: {
        name: string;
    };
}

interface SwitchModalProps {
    opened: boolean;
    handleClose: () => void;
}

interface RootState {
    auth: {
        myEnrollments: Enrollment[];
    };
    theme: {
        displayMode: string;
    };
}

function SwitchModal({ opened, handleClose }: SwitchModalProps) {
    const { myEnrollments } = useAppSelector((state) => state.auth);
    const [active, setActive] = useState<Enrollment | null>(null);
    const [program, setProgram] = useState<any>({});

    const dispatch = useDispatch();

    const getActive = async () => {
        const activeE = await storage.getItem('active_enrolment');
        if (activeE) {
            setActive(activeE);
        }
    };

    const handleSwitch = async (enrollment: Enrollment) => {
        dispatch(setEnrollment(enrollment));
        await storage.setItem('active_enrolment', enrollment);
        getActive();
        handleClose();
        toast.success(`Switched to ${enrollment.program.title}`);
        window.location.href = '/dashboard/program';
    };

    useEffect(() => {
        axios
            .get('/enrollment/myprogram')
            .then((res) => setProgram(res?.data))
            .catch((err) => console.log(err));

        getActive();
    }, []);

    return (
        <GlobalModal
            title='Switch Bootcamp'
            subTitle="If you wish to change to another program, please click on 'Switch' and proceed."
            open={opened}
            setOpen={handleClose}
            className='w-full max-w-4xl'
        >
            <div className='space-y-2 py-2'>
                {!myEnrollments || myEnrollments.length === 0 ? (
                    <div className='text-center py-8'>
                        <h2 className='text-xl font-semibold'>
                            No enrollment found
                        </h2>
                    </div>
                ) : (
                    myEnrollments.map((enroll, i) => (
                        <div
                            key={i}
                            className='bg-background rounded-md p-2 border border-forground-border'
                        >
                            <div className='flex flex-col md:flex-row justify-between'>
                                <div className='space-y-3 flex-1'>
                                    <div>
                                        <h3 className='text-lg font-medium'>
                                            {enroll?.program?.title}
                                        </h3>
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        <p className='min-w-[200px]'>
                                            <span className='font-medium'>
                                                Session:
                                            </span>{' '}
                                            {enroll?.session?.name}
                                        </p>
                                        <p>
                                            <span className='font-medium'>
                                                Company:
                                            </span>{' '}
                                            {enroll?.organization?.name}
                                        </p>
                                    </div>

                                    <div className='flex items-center gap-3 mt-3'>
                                        <div className='relative w-12 h-12 rounded-full overflow-hidden'>
                                            <Image
                                                src={
                                                    enroll?.program?.instructor
                                                        ?.image ||
                                                    '/clients/Abidur Rahman.jpg'
                                                }
                                                alt='Instructor'
                                                fill
                                                className='object-cover'
                                            />
                                        </div>
                                        <p>
                                            <span className='font-medium'>
                                                Instructor:
                                            </span>{' '}
                                            {enroll?.program?.instructor?.name}
                                        </p>
                                    </div>

                                    <div>
                                        <span className='font-medium'>
                                            Status:
                                        </span>{' '}
                                        <span
                                            className={`font-bold capitalize ${
                                                enroll?.status === 'approved'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            {enroll?.status}
                                        </span>
                                    </div>
                                </div>

                                <div className='flex items-end mt-4 md:mt-0'>
                                    {(enroll?.status === 'approved' ||
                                        enroll?.status === 'trial') && (
                                        <Button
                                            variant={
                                                enroll?.program?.title ===
                                                program?.program?.title
                                                    ? 'outline'
                                                    : 'default'
                                            }
                                            size='lg'
                                            disabled={
                                                enroll?._id === active?._id
                                            }
                                            onClick={() => handleSwitch(enroll)}
                                            className='w-full md:w-auto'
                                        >
                                            {enroll?.program?.title ===
                                            program?.program?.title
                                                ? 'Switched'
                                                : 'Switch'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </GlobalModal>
    );
}

export default SwitchModal;
