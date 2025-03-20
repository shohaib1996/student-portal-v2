'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    CloudUpload,
    Edit,
    Facebook,
    Github,
    Instagram,
    Linkedin,
    Twitter,
} from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Separator } from '@/components/ui/separator';
import PrimaryContact from './PrimaryContact';
import UpdateProfileInfo from './UpdateProfileInfo';
// import { useUploadImageMutation } from '@/redux/api/user/userApi';
import { toast } from 'sonner';
import Link from 'next/link';

const allowedImageExtensions = ['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG'];

function MyProfileForm() {
    const dispatch = useDispatch();
    // const [uploadImage, { isLoading }] = useUploadImageMutation();
    const { user } = useSelector(
        (state: { auth: { user: any } }) => state.auth,
    );
    const [isEditing, setIsEditing] = useState(false);

    const handleUploadImage = async (image: File) => {
        console.log(image);
        if (image) {
            const fileExtention = image.name?.split('.').pop();
            if (
                fileExtention &&
                !allowedImageExtensions.includes(fileExtention)
            ) {
                return toast.error(
                    'Invalid file type. Upload jpg, jpeg, or png only.',
                );
            }
        }
        const formData = new FormData();
        formData.append('image', image);
        console.log(formData);
        try {
            // const response = await uploadImage(formData).unwrap();
            // dispatch(setUser(response?.user));
            // toast.success(response?.message);
        } catch (error: any) {
            toast.error(error.data.error);
        }
    };
    return (
        <>
            <div className='flex items-center justify-between py-common'>
                <div>
                    <h1 className='font-semibold text-gray'>
                        Profile Settings
                    </h1>
                    <p className='text-gray'></p>
                </div>
                {isEditing || (
                    <Button
                        onClick={() => setIsEditing(true)}
                        className='text-pure-white bg-primary'
                    >
                        <Edit className='h-4 w-4' /> Edit
                    </Button>
                )}
            </div>
            <div className='mt-common-multiplied min-h-screen rounded-lg bg-background p-common-multiplied'>
                <div className='mx-auto space-y-common'>
                    <div>
                        <div className='relative mx-auto w-32 h-32'>
                            <Image
                                src={
                                    user?.profilePicture ||
                                    '/user/defaultUser.png'
                                }
                                alt='Profile photo'
                                width={350}
                                height={320}
                                className='h-full w-full animate-border-glow rounded-full border-4 border-primary p-0.5'
                                priority
                            />
                            {isEditing && (
                                <Label className='absolute bottom-0 right-1/3 cursor-pointer p-2'>
                                    <Input
                                        type='file'
                                        className='hidden'
                                        // disabled={isLoading}
                                        onChange={(e) => {
                                            if (
                                                e.target.files &&
                                                e.target.files.length > 0
                                            ) {
                                                handleUploadImage(
                                                    e.target.files[0],
                                                );
                                            }
                                        }}
                                    />
                                    {/* {isLoading ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <CloudUpload
                                            size={24}
                                            strokeWidth={2}
                                            className='text-primary'
                                        />
                                    )} */}

                                    <CloudUpload
                                        size={24}
                                        strokeWidth={2}
                                        className='text-primary'
                                    />
                                </Label>
                            )}
                        </div>
                        {!isEditing && (
                            <div className='mx-auto my-common flex items-center justify-center gap-common'>
                                <Link
                                    href={
                                        user?.personalData?.socialMedia
                                            ?.facebook || '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='flex items-center gap-2 rounded-full border border-primary p-1.5 text-primary transition hover:text-gray'
                                >
                                    <Facebook className='h-7 w-7 text-[#1877F2] hover:text-gray' />
                                </Link>
                                <Link
                                    href={
                                        user?.personalData?.socialMedia
                                            ?.github || '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='flex items-center gap-2 rounded-full border border-primary p-1.5 text-primary transition hover:text-gray'
                                >
                                    <Github className='h-7 w-7 text-black' />
                                </Link>
                                <Link
                                    href={
                                        user?.personalData?.socialMedia
                                            ?.instagram || '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='flex items-center gap-2 rounded-full border border-primary p-1.5 text-primary transition hover:text-gray'
                                >
                                    <Instagram className='h-7 w-7 text-[#C13584] hover:text-gray' />
                                </Link>
                                <Link
                                    href={
                                        user?.personalData?.socialMedia
                                            ?.linkedin || '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='flex items-center gap-2 rounded-full border border-primary p-1.5 text-primary transition hover:text-gray'
                                >
                                    <Linkedin className='h-7 w-7 text-[#0A66C2] hover:text-gray' />
                                </Link>
                                <Link
                                    href={
                                        user?.personalData?.socialMedia
                                            ?.twitter || '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='flex items-center gap-2 rounded-full border border-primary p-1.5 text-primary transition hover:text-gray'
                                >
                                    <Twitter className='h-7 w-7 text-[#1DA1F2] hover:text-gray' />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Primary Contacts */}
                    <PrimaryContact />

                    <Separator className='my-common border' />

                    {/* Personal Information */}
                    <UpdateProfileInfo
                        setIsEditing={setIsEditing}
                        isEditing={isEditing}
                    />
                </div>
            </div>
        </>
    );
}

export default MyProfileForm;
