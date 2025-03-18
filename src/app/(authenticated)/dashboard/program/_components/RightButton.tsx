import Link from 'next/link';

export default function RightButton() {
    return (
        <div className='flex flex-col sm:flex-row gap-1.5 w-full max-w-4xl mx-auto'>
            <Link
                href='/dashboard/leaderboard'
                className='text-dark-gray font-medium text-sm flex items-center gap-1 px-3 py-2 bg-background rounded-lg border border-gray-200 transition-colors'
            >
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 20 20'
                    fill='none'
                >
                    <g clipPath='url(#clip0_1_58141)'>
                        <path
                            d='M7.51657 5.23544L7.14029 7.4295C7.1026 7.64938 7.19293 7.87155 7.37345 8.00263C7.47553 8.07678 7.59638 8.11462 7.71784 8.11462C7.81107 8.11462 7.90476 8.09235 7.99051 8.04733L9.96088 7.01141L11.9312 8.04733C12.017 8.09235 12.1105 8.11462 12.2039 8.11462C12.2044 8.11462 12.205 8.11462 12.2056 8.11462C12.5288 8.11417 12.7906 7.85202 12.7906 7.52869C12.7906 7.48367 12.7856 7.43988 12.776 7.39777L12.4052 5.23544L13.9993 3.68149C14.159 3.52585 14.2166 3.293 14.1476 3.0809C14.0786 2.86881 13.8954 2.71423 13.6746 2.68219L11.4717 2.36206L10.4864 0.365601C10.3877 0.16571 10.184 0.0390625 9.96088 0.0390625C9.73795 0.0390625 9.53424 0.16571 9.43552 0.365601L8.45026 2.36191L6.24719 2.68204C6.02655 2.71423 5.84314 2.86881 5.77432 3.0809C5.70535 3.293 5.76288 3.52585 5.92249 3.68149L7.51657 5.23544ZM8.92359 3.47748C9.11447 3.44971 9.27942 3.32977 9.36472 3.15689L9.96088 1.94901L10.557 3.15689C10.6425 3.32977 10.8074 3.44971 10.9983 3.47748L12.3313 3.67111L11.3667 4.61136C11.2286 4.74594 11.1656 4.93988 11.1982 5.12985L11.4259 6.45752L10.2336 5.83069C10.1483 5.78583 10.0546 5.7634 9.96103 5.7634C9.86734 5.7634 9.77365 5.78583 9.68836 5.83069L8.49603 6.45752L8.7237 5.13001C8.75635 4.93988 8.69333 4.74594 8.55524 4.61136L7.59058 3.67111L8.92359 3.47748Z'
                            fill='#5C5958'
                        />
                        <path
                            d='M17.8059 13.2187H15.2956C14.9414 13.2187 14.6074 13.3051 14.3124 13.457V11.608C14.3124 10.4198 13.3458 9.45312 12.1576 9.45312H7.76428C6.57608 9.45312 5.60928 10.4198 5.60928 11.608V11.888C5.31433 11.7361 4.98032 11.6498 4.62631 11.6498H2.11594C0.927582 11.6496 -0.0390625 12.6164 -0.0390625 13.8046V19.4531C-0.0390625 19.7766 0.223236 20.0389 0.546875 20.0389H19.375C19.6986 20.0389 19.9609 19.7766 19.9609 19.4531V15.3737C19.9609 14.1855 18.9943 13.2187 17.8059 13.2187ZM1.13281 13.8046C1.13281 13.2626 1.57379 12.8215 2.11594 12.8215H4.62631C5.1683 12.8215 5.60928 13.2626 5.60928 13.8046V18.8672H1.13281V13.8046ZM6.78116 13.8046V11.608C6.78116 11.066 7.22229 10.625 7.76428 10.625H12.1576C12.6996 10.625 13.1406 11.066 13.1406 11.608V18.8672H6.78116V13.8046ZM18.7891 18.8672H14.3124V15.3737C14.3124 14.8315 14.7534 14.3906 15.2956 14.3906H17.8059C18.3481 14.3906 18.7891 14.8315 18.7891 15.3737V18.8672Z'
                            fill='#5C5958'
                        />
                    </g>
                    <defs>
                        <clipPath id='clip0_1_58141'>
                            <rect width='20' height='20' fill='' />
                        </clipPath>
                    </defs>
                </svg>
                <span>Leaderboard</span>
            </Link>

            <Link
                href='/progress'
                className='text-dark-gray font-medium text-sm flex items-center gap-2 px-3 py-2 bg-background rounded-lg border border-gray-200 transition-colors'
            >
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 20 20'
                    fill='none'
                >
                    <path
                        d='M5.7334 15.1254V13.4004'
                        stroke='#5C5958'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                    />
                    <path
                        d='M10 15.1258V11.6758'
                        stroke='#5C5958'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                    />
                    <path
                        d='M14.2666 15.1247V9.94141'
                        stroke='#5C5958'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                    />
                    <path
                        d='M14.2667 4.875L13.8834 5.325C11.7584 7.80833 8.9084 9.56667 5.7334 10.3583'
                        stroke='#5C5958'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                    />
                    <path
                        d='M11.8252 4.875H14.2669V7.30833'
                        stroke='#5C5958'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                    <path
                        d='M7.49984 18.3327H12.4998C16.6665 18.3327 18.3332 16.666 18.3332 12.4993V7.49935C18.3332 3.33268 16.6665 1.66602 12.4998 1.66602H7.49984C3.33317 1.66602 1.6665 3.33268 1.6665 7.49935V12.4993C1.6665 16.666 3.33317 18.3327 7.49984 18.3327Z'
                        stroke='#5C5958'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                </svg>
                <span>Progress</span>
            </Link>

            <Link
                href='/dashboard/switch-program'
                className='text-white font-medium text-sm flex items-center gap-2 px-3 py-2 bg-primary rounded-lg hover:bg-blue-700 transition-colors ml-auto'
            >
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='16'
                    height='16'
                    viewBox='0 0 16 16'
                    fill='none'
                >
                    <path
                        d='M10.6665 2L13.3332 4.66667L10.6665 7.33333'
                        stroke='white'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                    <path
                        d='M13.3332 4.66602H2.6665'
                        stroke='white'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                    <path
                        d='M5.33317 13.9993L2.6665 11.3327L5.33317 8.66602'
                        stroke='white'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                    <path
                        d='M2.6665 11.334H13.3332'
                        stroke='white'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                </svg>
                <span>Switch Bootcamp</span>
            </Link>
        </div>
    );
}
