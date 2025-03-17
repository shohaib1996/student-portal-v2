import { axiosBaseQuery } from '@/lib/axios/axiosBaseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { tagTypesList } from './tagType/tagTypes';

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: axiosBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL as string,
    }),
    tagTypes: [
        'Comments',
        'Replies',
        'SNT',
        'Doc',
        'DayToDayActivities',
        'TechnicalTests',
        'MockInterviews',
        'User',
        'Community',
        'DocLab',
        'Notification',
        'Payment History',
        'Payment History Id',
        ...tagTypesList,
    ],
    endpoints: () => ({}),
});
