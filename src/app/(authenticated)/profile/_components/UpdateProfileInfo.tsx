'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    CloudDownload,
    CloudUpload,
    Facebook,
    Github,
    Instagram,
    Linkedin,
    Twitter,
} from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

// import { useUploadDocumentMutation } from "@/redux/api/document/documentApi";
// import { useUpdateUserInfoMutation } from "@/redux/api/user/userApi";
// import { setUser } from "@/redux/features/auth/authSlice";
// import LoadingSpinner from "@/components/shared/global/LoadingSpinner/LoadingSpinner";
import dayjs from 'dayjs';
import PortalForm from '@/components/global/Form/PortalForm';
import PortalInput from '@/components/global/Form/Inputs/PortalInput';
import { Textarea } from '@/components/ui/textarea';

interface IUpdateProfileInfoProps {
    isEditing: boolean;
    setIsEditing: (open: boolean) => void;
}

const FormSchema = z.object({
    firstName: z.string().min(2, { message: 'First name is required' }),
    lastName: z.string().min(3, { message: 'Last name is required' }),
    street: z
        .string()
        .min(3, { message: 'Street must be at least 3 characters long' }),
    city: z
        .string()
        .min(2, { message: 'City must be at least 2 characters long' }),
    postalCode: z
        .string()
        .regex(/^\d{4,10}$/, { message: 'Invalid postal code format' }),
    country: z
        .string()
        .min(2, { message: 'Country must be at least 2 characters long' }),
    facebook: z
        .string()
        .url({ message: 'Invalid URL format' })
        .regex(/^https:\/\/(www\.)?facebook\.com\/[A-Za-z0-9._-]+$/, {
            message: 'Invalid Facebook profile URL',
        })
        .optional()
        .or(z.literal('')),
    github: z
        .string()
        .url({ message: 'Invalid URL format' })
        .regex(/^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_-]+$/, {
            message: 'Invalid GitHub profile URL',
        })
        .optional()
        .or(z.literal('')),
    instagram: z
        .string()
        .url({ message: 'Invalid URL format' })
        .regex(/^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._-]+$/, {
            message: 'Invalid Instagram profile URL',
        })
        .optional()
        .or(z.literal('')),
    linkedin: z
        .string()
        .url({ message: 'Invalid URL format' })
        .regex(
            /^https:\/\/(www\.)?linkedin\.com\/(in|company)\/[A-Za-z0-9_-]+$/,
            {
                message: 'Invalid LinkedIn profile URL',
            },
        )
        .optional()
        .or(z.literal('')),
    twitter: z
        .string()
        .url({ message: 'Invalid URL format' })
        .regex(/^https:\/\/(www\.)?twitter\.com\/[A-Za-z0-9_]+$/, {
            message: 'Invalid Twitter profile URL',
        })
        .optional()
        .or(z.literal('')),
});

const UpdateProfileInfo = ({
    setIsEditing,
    isEditing,
}: IUpdateProfileInfoProps) => {
    const dispatch = useDispatch();
    // const [uploadDocument, { isLoading }] = useUploadDocumentMutation();
    // const [updateUserInfo, { isLoading: isUpdating }] =
    //   useUpdateUserInfoMutation();
    const { user } = useSelector(
        (state: { auth: { user: any } }) => state.auth,
    );
    const [markdownContent, setMarkdownContent] = useState(
        user?.about || 'Please add something about you...',
    );
    const [files, setFiles] = useState<File[]>([]);
    const [uploadFiles, setUploadFiles] = useState<string[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [resumeFiledText, setResumeFiledText] = useState(
        'Please! Upload your resume...',
    );

    const defaultValues = {
        firstName: user?.firstName,
        lastName: user?.lastName,
        street: user?.personalData?.address?.street,
        city: user?.personalData?.address?.city,
        postalCode: user?.personalData?.address?.postalCode,
        country: user?.personalData?.address?.country,
        facebook: user?.personalData?.socialMedia?.facebook,
        github: user?.personalData?.socialMedia?.github,
        instagram: user?.personalData?.socialMedia?.instagram,
        linkedin: user?.personalData?.socialMedia?.linkedin,
        twitter: user?.personalData?.socialMedia?.twitter,
    };

    const addressFields = [
        { key: 1, name: 'street', label: 'Street' },
        { key: 2, name: 'city', label: 'City' },
        { key: 3, name: 'postalCode', label: 'Postal Code' },
        { key: 4, name: 'country', label: 'Country' },
    ];

    const socialMediaFields = [
        {
            key: 1,
            name: 'facebook',
            label: 'Facebook',
            icon: (
                <Facebook className='absolute left-1 top-[-3] h-5 w-5 text-[#1877F2]' />
            ),
        },
        {
            key: 2,
            name: 'github',
            label: 'GitHub',
            icon: (
                <Github className='absolute left-1 top-[-3] h-5 w-5 text-black' />
            ),
        },
        {
            key: 3,
            name: 'instagram',
            label: 'Instagram',
            icon: (
                <Instagram className='absolute left-1 top-[-3] h-5 w-5 text-[#C13584]' />
            ),
        },
        {
            key: 4,
            name: 'linkedin',
            label: 'LinkedIn',
            icon: (
                <Linkedin className='absolute left-1 top-[-4] h-5 w-5 text-[#0A66C2]' />
            ),
        },
        {
            key: 5,
            name: 'twitter',
            label: 'Twitter',
            icon: (
                <Twitter className='absolute left-1 top-[-3] h-5 w-5 text-[#1DA1F2]' />
            ),
        },
    ];

    // resume name formater
    const resumeNameFormater = (url: string) => {
        return (
            url?.split('/')?.pop()?.split('-')?.slice(1)?.join('-') ||
            'default-resume-name'
        );
    };

    // Download resume
    const handleDownload = async (fileUrl: string) => {
        if (!fileUrl) {
            return;
        }

        try {
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch file');
            }

            const blob = await response.blob();
            const fileName =
                fileUrl.split('/').pop()?.split('-').pop() || 'resume.pdf';

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    // Upload Resume
    const handleUpload = (uploadfiles: FileList | null) => {
        if (uploadfiles) {
            const fileList = Array.from(uploadfiles);
            const allowedExtensions = [
                'jpg',
                'jpeg',
                'png',
                'pdf',
                'doc',
                'docx',
            ];
            const filteredFiles = fileList.filter((file) => {
                const extension =
                    file.name.split('.').pop()?.toLowerCase() || '';
                return allowedExtensions.includes(extension);
            });
            filteredFiles.forEach(async (file) => {
                const exist = files.find((f) => file.name === f.name);
                if (!exist) {
                    setUploadingFiles(true);
                    setFiles((prev) => [...prev, file]);
                    const formData = new FormData();
                    formData.append('file', file);
                    console.log(formData);
                    try {
                        // const response = await uploadDocument(formData);
                        // setUploadFiles((prev) => [response?.data?.fileUrl]);
                        // setResumeFiledText(
                        //     resumeNameFormater(response?.data?.fileUrl),
                        // );
                        setUploadingFiles(false);
                    } catch (error) {
                        setUploadingFiles(false);
                        console.error('Error uploading file:', error);
                    }
                }
            });
        }
    };

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const {
            firstName,
            lastName,
            street,
            city,
            postalCode,
            country,
            facebook,
            github,
            instagram,
            linkedin,
            twitter,
        } = data;
        const updatedUser = {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            about: markdownContent,
            personalData: {
                resume: uploadFiles[0],
                address: {
                    city,
                    street,
                    country,
                    postalCode,
                },
                socialMedia: {
                    facebook,
                    github,
                    instagram,
                    linkedin,
                    twitter,
                },
            },
        };

        try {
            // const res = await updateUserInfo(updatedUser);
            // dispatch(setUser(res?.data?.user));
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating user info:', error);
            toast.error('Error updating user info');
        }
    }

    return (
        <PortalForm
            onSubmit={onSubmit}
            resolver={zodResolver(FormSchema)}
            defaultValues={defaultValues}
        >
            <section>
                <h4 className='mb-common text-2xl font-medium text-gray'>
                    Personal Informations
                </h4>
                <div className='grid gap-common md:grid-cols-2'>
                    <div>
                        <PortalInput
                            placeholder='First Name'
                            ngClass='bg-foreground mt-common'
                            name='firstName'
                            label='First Name'
                            required={isEditing}
                            readonly={!isEditing}
                        />
                    </div>
                    <div>
                        <PortalInput
                            placeholder='Last Name'
                            ngClass='bg-foreground mt-common'
                            name='lastName'
                            label='Last Name'
                            required={isEditing}
                            readonly={!isEditing}
                        />
                    </div>
                </div>
            </section>

            {/* Member Since & Resume */}
            <div className='grid gap-common md:grid-cols-2'>
                <div>
                    <PortalInput
                        placeholder={dayjs(user?.createdAt).format(
                            'MMMM DD, YYYY',
                        )}
                        ngClass='bg-foreground mt-common cursor-not-allowed'
                        name='memberSince'
                        label='Member Since'
                        readonly={true}
                    />
                </div>
                <div>
                    <Label className='text-sm font-semibold text-gray'>
                        Resume
                    </Label>
                    {isEditing ? (
                        <>
                            <Label className='mt-2 flex w-full cursor-pointer items-center justify-center gap-common rounded-lg bg-foreground py-1 text-gray'>
                                <Input
                                    type='file'
                                    name='resume'
                                    className='hidden'
                                    onChange={(e) =>
                                        handleUpload(e.target.files)
                                    }
                                />
                                <CloudUpload
                                    size={32}
                                    strokeWidth={2}
                                    className='py-1'
                                />{' '}
                                <span>
                                    {uploadingFiles
                                        ? 'Uploading...'
                                        : resumeFiledText}
                                </span>
                            </Label>
                        </>
                    ) : (
                        <>
                            <Label
                                className={`mt-2 flex w-full items-center justify-center gap-common rounded-lg bg-foreground py-1 text-gray ${user?.personalData?.resume ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                onClick={() =>
                                    user?.personalData?.resume &&
                                    handleDownload(user?.personalData?.resume)
                                }
                            >
                                <CloudDownload
                                    size={32}
                                    strokeWidth={2}
                                    className='py-1'
                                />
                                <span>
                                    {!user?.personalData?.resume
                                        ? 'Resume not uploaded...'
                                        : resumeNameFormater(
                                              user?.personalData?.resume,
                                          ) + ' Download'}
                                </span>
                            </Label>
                        </>
                    )}
                </div>
            </div>

            {/* Address section*/}
            <section>
                <h4 className='mb-common text-2xl font-medium text-gray'>
                    Address
                </h4>
                <div className='grid gap-common md:grid-cols-2'>
                    {addressFields.map((item) => (
                        <PortalInput
                            key={item.key}
                            placeholder={item.label}
                            ngClass='bg-foreground mt-common'
                            name={item.name}
                            label={item.label}
                            readonly={!isEditing}
                        />
                    ))}
                </div>
            </section>

            {/* Social Media Links Section */}
            {isEditing && (
                <section>
                    <h4 className='mb-common text-2xl font-medium text-gray'>
                        Social Links
                    </h4>
                    <div className='grid gap-common md:grid-cols-2'>
                        {socialMediaFields.map((item) => (
                            <PortalInput
                                key={item.key}
                                placeholder={item.label}
                                ngClass='bg-foreground mt-common'
                                name={item.name}
                                label={item.label}
                                readonly={!isEditing}
                                leftIcon={isEditing ? item.icon : null}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* About Section */}
            <section>
                <h4 className='mb-common text-2xl font-medium text-gray'>
                    About
                </h4>
                {isEditing ? (
                    <div className='rounded border border-gray bg-background'>
                        <Textarea
                            value={markdownContent}
                            // setValue={setMarkdownContent}
                        />
                    </div>
                ) : (
                    <p className='text-gray'>{user?.about || 'Not Provided'}</p>
                )}
            </section>

            {/* cancel and save button end  */}
            {isEditing && (
                <div className='flex justify-end gap-common'>
                    <Button
                        type='button'
                        variant='danger_light'
                        className='bg-danger/50'
                        onClick={() => setIsEditing(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        className='hover:bg-primary-light bg-primary'
                        // disabled={isLoading || isUpdating}
                    >
                        {/* {isUpdating ? <LoadingSpinner /> : 'Save'} */}
                        Save
                    </Button>
                </div>
            )}
        </PortalForm>
    );
};

export default UpdateProfileInfo;
