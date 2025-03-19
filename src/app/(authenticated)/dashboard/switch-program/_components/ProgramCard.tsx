import { RadialProgress } from '@/components/global/RadialProgress';
import {
    ArrowRight,
    Package,
    CheckCircle,
    XCircle,
    Clock,
    Check,
} from 'lucide-react';
import Image from 'next/image';
import React from 'react';

type Status = 'approved' | 'pending' | 'cancelled';

export interface BootcampProgram {
    id: string;
    title: string;
    image: string;
    rating: number;
    status: Status;
    user: {
        name: string;
        avatar: string;
        online?: boolean;
    };
    organization: string;
    branch: string;
    date: string;
    payment: {
        totalFee: number;
        paid: number;
        due: number;
    };
    progress: number;
    switched?: boolean;
}

const ProgramCard = ({ program }: { program: BootcampProgram }) => {
    const getStatusBadge = (status: Status) => {
        switch (status) {
            case 'approved':
                return (
                    <div className='absolute top-3 left-3 bg-background z-10 text-green-600 px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium'>
                        <CheckCircle className='h-4 w-4' />
                        Approved
                    </div>
                );
            case 'pending':
                return (
                    <div className='absolute top-3 left-3 bg-background z-10 text-amber-500 px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium'>
                        <Clock className='h-4 w-4' />
                        Pending
                    </div>
                );
            case 'cancelled':
                return (
                    <div className='absolute top-3 left-3 bg-background z-10 text-red-500 px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium'>
                        <XCircle className='h-4 w-4' />
                        Cancelled
                    </div>
                );
        }
    };

    return (
        <div className='bg-foreground rounded-xl overflow-hidden border border-border'>
            {/* Banner Image with Status Badge */}
            <div className='relative'>
                {getStatusBadge(program.status)}
                <Image
                    src={program.image || '/placeholder.svg'}
                    alt={program.title}
                    className='object-contain md:object-cover w-[403px] h-[200px]'
                    width={900}
                    height={599}
                />
                <div className='absolute bottom-2 left-3'>
                    <div className='flex items-center gap-2'>
                        <Package className='h-5 w-5 text-white' />
                        <h3 className='font-semibold text-white'>
                            {program.title}
                        </h3>
                    </div>
                    <div className='flex items-center'>
                        {[...Array(5)].map((_, i) => (
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='12'
                                height='13'
                                viewBox='0 0 12 13'
                                fill='none'
                                key={i}
                            >
                                <g clipPath='url(#clip0_77_29781)'>
                                    <path
                                        d='M6.19265 9.11938C6.07265 9.04609 5.92173 9.04609 5.80173 9.11938L3.82757 10.3251C3.54291 10.499 3.18996 10.2425 3.26734 9.91807L3.80405 7.66779C3.83667 7.53101 3.79003 7.38748 3.68324 7.296L1.92698 5.79159C1.67364 5.57458 1.80848 5.15963 2.14099 5.13299L4.44635 4.94829C4.58653 4.93706 4.70865 4.84834 4.76265 4.71849L5.65094 2.58257C5.77903 2.27457 6.21535 2.27457 6.34344 2.58257L7.23172 4.71849C7.28573 4.84834 7.40785 4.93706 7.54803 4.94829L9.85375 5.13299C10.1863 5.15963 10.3211 5.57462 10.0677 5.79161L8.31117 7.296C8.20436 7.38747 8.15771 7.53102 8.19033 7.66782L8.72703 9.91807C8.80442 10.2425 8.45146 10.499 8.1668 10.3251L6.19265 9.11938Z'
                                        fill='#EF7817'
                                    />
                                </g>
                                <defs>
                                    <clipPath id='clip0_77_29781'>
                                        <rect
                                            y='0.5'
                                            width='12'
                                            height='12'
                                            rx='0.75'
                                            fill='white'
                                        />
                                    </clipPath>
                                </defs>
                            </svg>
                        ))}
                        <span className='text-white text-sm ml-1'>
                            ({program.rating}.0)
                        </span>
                    </div>
                </div>
            </div>

            {/* Program Title and Rating */}
            <div className='p-2'>
                {/* User Info */}
                <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-2'>
                        <div className='relative'>
                            <Image
                                src={program.user.avatar || '/placeholder.svg'}
                                alt={program.user.name}
                                width={28}
                                height={28}
                                className='rounded-full'
                            />
                            {program.user.online && (
                                <div className='absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-foreground'></div>
                            )}
                        </div>
                        <span className='text-sm font-medium'>
                            {program.user.name}
                        </span>
                    </div>

                    <button className='border border-border rounded-md py-1 px-2 text-primary text-xs font-medium flex items-center gap-1'>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='15'
                            height='15'
                            viewBox='0 0 15 15'
                            fill='none'
                        >
                            <g clipPath='url(#clip0_77_29700)'>
                                <path
                                    d='M9.76243 2.40495C9.72312 2.28398 9.62377 2.19213 9.50007 2.16245L8.58058 1.94184L8.08662 1.13552C8.02017 1.02705 7.90212 0.960938 7.77494 0.960938C7.64776 0.960938 7.52969 1.02705 7.46324 1.13552L6.96928 1.94184L6.04979 2.16245C5.92609 2.19213 5.82674 2.28396 5.78743 2.40495C5.74812 2.52592 5.77452 2.65863 5.85715 2.75533L6.47137 3.47428L6.39705 4.41695C6.38705 4.54377 6.44369 4.66664 6.5466 4.7414C6.64953 4.81616 6.78388 4.83208 6.90139 4.78336L7.77497 4.42139L8.64852 4.78336C8.76545 4.83188 8.90016 4.81638 9.00331 4.7414C9.10622 4.66664 9.16286 4.54377 9.15286 4.41695L9.07854 3.47428L9.69276 2.75533C9.77535 2.65863 9.80176 2.52592 9.76243 2.40495ZM8.42428 3.11457C8.36129 3.18829 8.33017 3.28406 8.33779 3.38073L8.37713 3.87957L7.91487 3.68802C7.82529 3.65091 7.7246 3.65091 7.63502 3.68802L7.17274 3.87957L7.21207 3.38076C7.2197 3.28406 7.18858 3.18831 7.12558 3.11457L6.80055 2.73412L7.28712 2.6174C7.38143 2.59478 7.46287 2.53559 7.51354 2.45291L7.77494 2.02623L8.03633 2.45291C8.08699 2.53561 8.16843 2.59478 8.26274 2.6174L8.74931 2.73415L8.42428 3.11457Z'
                                    fill='#062BA7'
                                    stroke='#062BA7'
                                    strokeWidth='0.501305'
                                />
                                <path
                                    d='M14.1531 4.15885C14.1137 4.03789 14.0144 3.94604 13.8907 3.91636L12.9712 3.69575L12.4772 2.88942C12.4108 2.78096 12.2927 2.71484 12.1656 2.71484C12.0384 2.71484 11.9203 2.78096 11.8539 2.88942L11.3599 3.69575L10.4404 3.91636C10.3167 3.94604 10.2174 4.03786 10.1781 4.15885C10.1387 4.27982 10.1651 4.41254 10.2478 4.50923L10.862 5.22819L10.7877 6.17086C10.7777 6.29767 10.8343 6.42054 10.9372 6.49531C11.0402 6.57007 11.1745 6.58598 11.292 6.53727L12.1656 6.17529L13.0391 6.53727C13.1561 6.58579 13.2908 6.57029 13.3939 6.49531C13.4968 6.42054 13.5535 6.29767 13.5435 6.17086L13.4692 5.22819L14.0834 4.50923C14.166 4.41254 14.1924 4.27982 14.1531 4.15885ZM12.8149 4.86848C12.7519 4.9422 12.7208 5.03797 12.7284 5.13464L12.7678 5.63347L12.3055 5.44193C12.2159 5.40482 12.1152 5.40482 12.0256 5.44193L11.5634 5.63347L11.6027 5.13466C11.6103 5.03797 11.5792 4.94222 11.5162 4.86848L11.1912 4.48803L11.6777 4.3713C11.7721 4.34869 11.8535 4.2895 11.9042 4.20681L12.1656 3.78014L12.427 4.20681C12.4776 4.28952 12.5591 4.34869 12.6534 4.3713L13.1399 4.48806L12.8149 4.86848Z'
                                    fill='#062BA7'
                                    stroke='#062BA7'
                                    strokeWidth='0.501305'
                                />
                                <path
                                    d='M5.37962 4.15885C5.34031 4.03789 5.24096 3.94604 5.11726 3.91636L4.19777 3.69575L3.70381 2.88942C3.63736 2.78096 3.51931 2.71484 3.39213 2.71484C3.26495 2.71484 3.14688 2.78096 3.08043 2.88942L2.58647 3.69575L1.66697 3.91636C1.54328 3.94604 1.44393 4.03786 1.40462 4.15885C1.36531 4.27982 1.3917 4.41254 1.47434 4.50923L2.08856 5.22819L2.01423 6.17086C2.00424 6.29767 2.06088 6.42054 2.16379 6.49531C2.26672 6.57007 2.40107 6.58598 2.51857 6.53727L3.39216 6.17529L4.26571 6.53727C4.38263 6.58579 4.51735 6.57029 4.6205 6.49531C4.72341 6.42054 4.78004 6.29767 4.77005 6.17086L4.69573 5.22819L5.30995 4.50923C5.39253 4.41254 5.41895 4.27982 5.37962 4.15885ZM4.04147 4.86848C3.97847 4.9422 3.94735 5.03797 3.95498 5.13464L3.99431 5.63347L3.53206 5.44193C3.44248 5.40482 3.34178 5.40482 3.2522 5.44193L2.78992 5.63347L2.82926 5.13466C2.83688 5.03797 2.80576 4.94222 2.74277 4.86848L2.41774 4.48803L2.90431 4.3713C2.99862 4.34869 3.08006 4.2895 3.13072 4.20681L3.39213 3.78014L3.65351 4.20681C3.70418 4.28952 3.78562 4.34869 3.87993 4.3713L4.3665 4.48806L4.04147 4.86848Z'
                                    fill='#062BA7'
                                    stroke='#062BA7'
                                    strokeWidth='0.501305'
                                />
                                <path
                                    d='M12.098 9.25569C11.8589 8.97106 11.5085 8.80781 11.1368 8.80781H9.77563L10.0137 8.06661C10.0594 7.92721 10.0826 7.78256 10.0826 7.63664C10.0826 7.03718 9.69953 6.50945 9.12961 6.32346C8.70456 6.18441 8.24562 6.41709 8.10616 6.84345L7.5514 8.56159C7.48438 8.76697 7.32282 8.93319 7.11936 9.00615L6.49327 9.23044V9.00276C6.49327 8.80089 6.32961 8.63723 6.12774 8.63723H4.27569C4.07382 8.63723 3.91016 8.80089 3.91016 9.00276V13.3892C3.91016 13.5911 4.07382 13.7547 4.27569 13.7547H6.12774C6.32961 13.7547 6.49327 13.5911 6.49327 13.3892V13.0459C6.68091 13.0616 6.85525 13.142 6.98972 13.2765C7.2712 13.561 7.67039 13.7262 8.07117 13.7245H10.5005C11.237 13.7245 11.8637 13.1979 11.9906 12.4722L12.3734 10.2794C12.4375 9.91334 12.3371 9.54022 12.098 9.25569ZM5.7622 13.0237H4.64123V9.3683H5.7622V13.0237ZM11.6533 10.1535L11.2705 12.3463C11.2049 12.7213 10.8811 12.9934 10.5005 12.9934H8.07119C7.86186 12.9942 7.65402 12.9084 7.50697 12.7598C7.23409 12.4869 6.8763 12.3301 6.49327 12.3135V10.007L7.366 9.69436C7.78066 9.54563 8.10977 9.20698 8.24672 8.78732L8.80141 7.0694C8.8151 7.02753 8.86033 7.00463 8.90254 7.0184C9.24117 7.12391 9.43391 7.50539 9.31832 7.84092L8.92623 9.06157C8.84651 9.28835 9.03398 9.54541 9.27424 9.53888H11.1368C11.4529 9.53118 11.7154 9.84328 11.6533 10.1535Z'
                                    fill='#062BA7'
                                    stroke='#062BA7'
                                    strokeWidth='0.501305'
                                />
                            </g>
                            <defs>
                                <clipPath id='clip0_77_29700'>
                                    <rect
                                        width='14.0366'
                                        height='14.0366'
                                        fill='white'
                                        transform='translate(0.925781 0.498047)'
                                    />
                                </clipPath>
                            </defs>
                        </svg>
                        Give a Review
                    </button>
                </div>

                {/* Organization Info */}
                <div className='flex justify-between items-center'>
                    <div className='space-y-1 mb-3'>
                        <div className='flex items-center gap-2'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='13'
                                height='13'
                                viewBox='0 0 13 13'
                                fill='none'
                                className='h-4 w-4'
                            >
                                <g clipPath='url(#clip0_77_29716)'>
                                    <path
                                        d='M6.00217 4.18003C6.59781 4.18003 7.08247 3.69547 7.08247 3.09974C7.08247 2.5041 6.59781 2.01953 6.00217 2.01953C5.40654 2.01953 4.92188 2.5041 4.92188 3.09974C4.92188 3.69547 5.40654 4.18003 6.00217 4.18003ZM6.00217 2.72449C6.20916 2.72449 6.37751 2.89284 6.37751 3.09974C6.37751 3.30673 6.20907 3.47507 6.00217 3.47507C5.79527 3.47507 5.62684 3.30673 5.62684 3.09974C5.62684 2.89284 5.79518 2.72449 6.00217 2.72449Z'
                                        fill='#2A2E2F'
                                    />
                                    <path
                                        d='M12.0313 5.29267V3.30355L6.01567 0.53125L0 3.30355V5.29267H1.1876V8.85144H0.563969V10.1967H0V12.5407H12.0313V10.1967H11.7258V8.85144H10.8202V5.29267H12.0313ZM0.704961 4.58771V3.75489L6.01567 1.30744L11.3264 3.75489V4.58762H0.704961V4.58771ZM4.85881 8.85144H3.47781V5.29267H4.85881V8.85144ZM5.56378 5.29267H6.44406V8.85144H5.56378V5.29267ZM7.14902 5.29267H8.53003V8.85144H7.14902V5.29267ZM1.89256 5.29267H2.77285V8.85144H1.89256V5.29267ZM11.3264 11.8358H0.704961V10.9017H11.3264V11.8358ZM11.0209 9.5564V10.1967H1.26893V9.5564H11.0209ZM10.1153 8.85144H9.23499V5.29267H10.1153V8.85144Z'
                                        fill='#2A2E2F'
                                    />
                                </g>
                                <defs>
                                    <clipPath id='clip0_77_29716'>
                                        <rect
                                            width='12.0313'
                                            height='12.0313'
                                            fill='white'
                                            transform='translate(0 0.53125)'
                                        />
                                    </clipPath>
                                </defs>
                            </svg>
                            <span className='text-xs text-gray'>
                                {program.organization}
                            </span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='15'
                                height='15'
                                viewBox='0 0 15 15'
                                fill='none'
                                className='h-4 w-4 text-gray'
                            >
                                <path
                                    d='M11.9681 10.0493V8.52871C11.9681 8.15421 11.8194 7.79501 11.5548 7.52997C11.2903 7.26494 10.9313 7.11574 10.5568 7.11512H7.36348V5.07455C7.74629 4.98821 8.08383 4.76377 8.31153 4.44415C8.53923 4.12454 8.64111 3.7322 8.59767 3.34219C8.55423 2.95217 8.36853 2.59186 8.07609 2.33019C7.78364 2.06851 7.40499 1.92383 7.01257 1.92383C6.62014 1.92383 6.24149 2.06851 5.94905 2.33019C5.6566 2.59186 5.4709 2.95217 5.42746 3.34219C5.38403 3.7322 5.4859 4.12454 5.7136 4.44415C5.9413 4.76377 6.27884 4.98821 6.66165 5.07455V7.1157H3.47126C3.09639 7.11601 2.73696 7.26502 2.47183 7.53004C2.2067 7.79506 2.05754 8.15443 2.05708 8.5293V10.0499C1.67411 10.1363 1.33642 10.3608 1.10861 10.6805C0.880798 11.0002 0.778862 11.3927 0.822301 11.7829C0.86574 12.1731 1.05151 12.5335 1.34406 12.7953C1.63661 13.0571 2.01541 13.2018 2.40799 13.2018C2.80057 13.2018 3.17937 13.0571 3.47193 12.7953C3.76448 12.5335 3.95024 12.1731 3.99368 11.7829C4.03712 11.3927 3.93519 11.0002 3.70738 10.6805C3.47957 10.3608 3.14187 10.1363 2.75891 10.0499V8.5293C2.75922 8.34047 2.83437 8.15945 2.96789 8.02593C3.10142 7.8924 3.28243 7.81725 3.47126 7.81694H6.66165V10.0488C6.27884 10.1351 5.9413 10.3595 5.7136 10.6792C5.4859 10.9988 5.38403 11.3911 5.42746 11.7811C5.4709 12.1711 5.6566 12.5314 5.94905 12.7931C6.24149 13.0548 6.62014 13.1995 7.01257 13.1995C7.40499 13.1995 7.78364 13.0548 8.07609 12.7931C8.36853 12.5314 8.55423 12.1711 8.59767 11.7811C8.64111 11.3911 8.53923 10.9988 8.31153 10.6792C8.08383 10.3595 7.74629 10.1351 7.36348 10.0488V7.81753H10.5568C10.7453 7.81815 10.9259 7.89347 11.059 8.027C11.1921 8.16052 11.2668 8.34136 11.2668 8.52988V10.0505C10.884 10.1369 10.5465 10.3613 10.3188 10.6809C10.0911 11.0005 9.98919 11.3929 10.0326 11.7829C10.0761 12.1729 10.2618 12.5332 10.5542 12.7949C10.8466 13.0566 11.2253 13.2012 11.6177 13.2012C12.0102 13.2012 12.3888 13.0566 12.6812 12.7949C12.9737 12.5332 13.1594 12.1729 13.2028 11.7829C13.2463 11.3929 13.1444 11.0005 12.9167 10.6809C12.689 10.3613 12.3515 10.1369 11.9686 10.0505L11.9681 10.0493ZM3.30165 11.6021C3.30165 11.7788 3.24927 11.9514 3.15114 12.0983C3.05301 12.2452 2.91353 12.3596 2.75034 12.4272C2.58715 12.4948 2.40759 12.5125 2.23435 12.478C2.06111 12.4436 1.90198 12.3585 1.77708 12.2336C1.65218 12.1087 1.56712 11.9496 1.53266 11.7764C1.4982 11.6031 1.51589 11.4236 1.58348 11.2604C1.65108 11.0972 1.76555 10.9577 1.91241 10.8596C2.05928 10.7614 2.23194 10.7091 2.40858 10.7091C2.64534 10.7094 2.87232 10.8036 3.03974 10.971C3.20715 11.1384 3.30134 11.3654 3.30165 11.6021ZM7.90623 11.6021C7.90623 11.7787 7.85386 11.9514 7.75576 12.0982C7.65765 12.2451 7.51821 12.3596 7.35505 12.4272C7.1919 12.4948 7.01236 12.5125 6.83914 12.4781C6.66591 12.4437 6.50678 12.3587 6.38186 12.2338C6.25694 12.109 6.17183 11.9499 6.13731 11.7767C6.10278 11.6035 6.12038 11.424 6.18789 11.2608C6.25539 11.0976 6.36977 10.9581 6.51656 10.8599C6.66335 10.7617 6.83596 10.7092 7.01257 10.7091C7.24928 10.7095 7.47617 10.8038 7.64355 10.9711C7.81094 11.1385 7.90576 11.3654 7.90623 11.6021ZM7.01257 4.41483C6.83577 4.41495 6.66291 4.36262 6.51586 4.26447C6.3688 4.16632 6.25417 4.02675 6.18646 3.86343C6.11875 3.70011 6.101 3.52038 6.13546 3.34697C6.16993 3.17356 6.25505 3.01428 6.38007 2.88926C6.50508 2.76424 6.66437 2.67912 6.83778 2.64466C7.01119 2.61019 7.19092 2.62794 7.35424 2.69565C7.51756 2.76336 7.65713 2.878 7.75528 3.02505C7.85343 3.1721 7.90576 3.34496 7.90564 3.52176C7.90533 3.75852 7.81114 3.9855 7.64372 4.15292C7.47631 4.32033 7.24933 4.41452 7.01257 4.41483ZM11.6171 12.4958C11.4404 12.4959 11.2675 12.4436 11.1205 12.3455C10.9735 12.2473 10.8588 12.1078 10.7911 11.9445C10.7234 11.7812 10.7056 11.6015 10.74 11.4281C10.7744 11.2548 10.8595 11.0955 10.9844 10.9704C11.1094 10.8454 11.2686 10.7602 11.442 10.7257C11.6154 10.6912 11.7951 10.7088 11.9584 10.7764C12.1217 10.8441 12.2613 10.9586 12.3596 11.1056C12.4578 11.2526 12.5102 11.4254 12.5102 11.6021C12.5101 11.8391 12.416 12.0662 12.2485 12.2339C12.0811 12.4015 11.8541 12.4953 11.6171 12.4958Z'
                                    fill='#2A2E2F'
                                    stroke='#2A2E2F'
                                    strokeWidth='0.200522'
                                />
                            </svg>
                            <span className='text-xs text-gray'>
                                {program.branch}
                            </span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='12'
                                height='12'
                                viewBox='0 0 12 12'
                                fill='none'
                                className='h-4 w-4 text-gray'
                            >
                                <path
                                    d='M3.67773 0.984375V2.36297'
                                    stroke='#2A2E2F'
                                    strokeWidth='0.973123'
                                    strokeMiterlimit='10'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M7.35156 0.984375V2.36297'
                                    stroke='#2A2E2F'
                                    strokeWidth='0.973123'
                                    strokeMiterlimit='10'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M1.60938 4.24023H9.42139'
                                    stroke='#2A2E2F'
                                    strokeWidth='0.973123'
                                    strokeMiterlimit='10'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M9.65045 3.97148V7.87749C9.65045 9.25608 8.96115 10.1751 7.3528 10.1751H3.67656C2.0682 10.1751 1.37891 9.25608 1.37891 7.87749V3.97148C1.37891 2.59289 2.0682 1.67383 3.67656 1.67383H7.3528C8.96115 1.67383 9.65045 2.59289 9.65045 3.97148Z'
                                    stroke='#2A2E2F'
                                    strokeWidth='0.973123'
                                    strokeMiterlimit='10'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M7.21357 6.36062H7.2177'
                                    stroke='#2A2E2F'
                                    strokeWidth='1.10287'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M7.21357 7.73953H7.2177'
                                    stroke='#2A2E2F'
                                    strokeWidth='1.10287'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M5.5124 6.36062H5.51652'
                                    stroke='#2A2E2F'
                                    strokeWidth='1.10287'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M5.5124 7.73953H5.51652'
                                    stroke='#2A2E2F'
                                    strokeWidth='1.10287'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M3.81123 6.36062H3.81535'
                                    stroke='#2A2E2F'
                                    strokeWidth='1.10287'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M3.81123 7.73953H3.81535'
                                    stroke='#2A2E2F'
                                    strokeWidth='1.10287'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                            <span className='text-xs text-gray'>
                                {program.date}
                            </span>
                        </div>
                    </div>
                    <div className='relative'>
                        <RadialProgress
                            value={program.progress}
                            size='sm'
                            thickness='medium'
                            color='primary'
                        />
                    </div>
                </div>

                {/* Payment Info */}
                <div className='grid grid-cols-3 p-2 gap-2 mb-1.5 bg-primary-light rounded-md'>
                    <div className='border-r border-border'>
                        <div className='text-xs text-gray'>Total Fee</div>
                        <div className='text-xs text-black font-semibold'>
                            ${program.payment.totalFee.toLocaleString()}.00
                        </div>
                    </div>
                    <div className='border-r border-border'>
                        <div className='text-xs text-gray'>Paid</div>
                        <div className='text-xs text-black font-semibold'>
                            ${program.payment.paid.toLocaleString()}.00
                        </div>
                    </div>
                    <div>
                        <div className='text-xs flex items-center gap-1'>
                            <span className='text-gray'>Due</span>
                            {program.payment.due > 0 && (
                                <button className='bg-primary text-white text-[10px] px-1 py-0.5 rounded'>
                                    $ Pay Now
                                </button>
                            )}
                        </div>
                        <div className='text-xs text-black font-semibold'>
                            ${program.payment.due.toLocaleString()}.00
                        </div>
                    </div>
                </div>

                {/* Progress Circle and Action Button */}
                <div className='flex items-center justify-between border-t pt-1.5'>
                    {program.switched ? (
                        <button className='w-full py-2 bg-primary-light text-primary rounded-md flex items-center justify-center gap-1 font-semibold'>
                            <Check size={18} />
                            Switched
                        </button>
                    ) : (
                        <button className='w-full py-2 bg-primary text-white rounded flex items-center justify-center gap-1 font-medium'>
                            Switch to Program <ArrowRight className='h-4 w-4' />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgramCard;
