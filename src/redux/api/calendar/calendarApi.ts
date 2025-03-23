import { baseApi } from '../baseApi';
import { tagTypes } from '../tagType/tagTypes';

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
            providesTags: (result, error, id) => [
                { type: tagTypes.singleEvent, id },
            ],
        }),
        updateEvent: build.mutation({
            query: ({
                id,
                updateOption,
                changes,
            }: {
                id: string;
                updateOption: 'thisAndFollowing' | 'thisEvent' | 'allEvents';
                changes: any;
            }) => ({
                url: `v2/calendar/event/update/${id}`,
                method: 'PATCH',
                data: {
                    updateOption,
                    changes,
                },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: tagTypes.singleEvent, id },
            ],
        }),
        deleteEvent: build.mutation({
            query: ({
                id,
                deleteOption,
            }: {
                id: string;
                deleteOption: string;
            }) => ({
                url: `v2/calendar/event/delete/${id}?deleteOption=${deleteOption}`,
                method: 'DELETE',
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
    useUpdateEventMutation,
    useDeleteEventMutation,
} = calendarApi;
