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
            query: (params: any) => ({
                url: `/v2/calendar/event/myevents`,
                method: 'GET',
                params,
            }),
        }),
        fetchUsers: build.query({
            query: (searchQuery: string) => ({
                url: '/user/filter',
                method: 'POST',
                data: { query: searchQuery, global: true },
            }),
        }),
        findUserAvailability: build.query({
            query: (id: string) => ({
                url: `/calendar/schedule/find/${id}`,
                method: 'GET',
            }),
        }),
        createEvent: build.mutation({
            query: (data: any) => ({
                url: 'v2/calendar/event/create',
                method: 'POST',
                data,
            }),
        }),
        getSingleEvent: build.query({
            query: (id: string) => ({
                url: `v2/calendar/event/details/${id}`,
                method: 'GET',
            }),
        }),
    }),
});

export const {
    useGetMyEventsQuery,
    useFetchUsersQuery,
    useFindUserAvailabilityQuery,
    useCreateEventMutation,
    useGetSingleEventQuery,
} = calendarApi;
