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
    }),
});

export const {
    useGetMyEventsQuery,
    useFetchUsersQuery,
    useFindUserAvailabilityQuery,
    useCreateEventMutation,
} = calendarApi;
