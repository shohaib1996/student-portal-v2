// @/redux/api/calendar/calendarApi.js
import { baseApi } from '../baseApi';
import { tagTypes } from '../tagType/tagTypes';

const calendarApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getPortalData: build.query({
            query: (data) => ({
                url: '/dashboard/portal',
                method: 'POST',
                data: data,
            }),
            providesTags: [tagTypes.course],
            // transformResponse: (response: {
            //     data: { calendar: { results: any } };
            // }) => ({
            //     results: response.data.calendar.results,
            // }),
        }),
    }),
});

export const { useGetPortalDataQuery } = calendarApi;
