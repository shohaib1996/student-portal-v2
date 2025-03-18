import { baseApi } from '../baseApi';

type TParams = {
    queryDate: {
        from: string;
        to: string;
    };
};

const calendarApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getMyEvents: build.query({
            query: (params: TParams) => ({
                url: `/v2/calendar/event/myevents?from=${params.queryDate.from}&to=${params.queryDate.to}`,
                method: 'GET',
                // params
            }),
        }),
    }),
});

export const { useGetMyEventsQuery } = calendarApi;
