import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/api/tagType/tagTypes';
import dayjs from 'dayjs';
import { string } from 'zod';
import { TEvent, TUpdateSchedule } from '../types/calendarTypes';

type TParams = {
    queryDate: {
        from: string;
        to: string;
    };
};

const calendarApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getMyEvents: build.query<{ events: TEvent[] }, any>({
            query: (params: any) => ({
                url: `/v2/calendar/event/myevents`,
                method: 'GET',
                params,
            }),
            providesTags: (result, error, params) =>
                result
                    ? [{ type: tagTypes.calendar, id: JSON.stringify(params) }]
                    : [tagTypes.calendar],
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
            async onQueryStarted(args, { dispatch, queryFulfilled, getState }) {
                try {
                    const { data: createdEvent } = await queryFulfilled;

                    if (
                        createdEvent &&
                        (createdEvent.event as TEvent).recurrence?.isRecurring
                    ) {
                        dispatch(
                            calendarApi.util.invalidateTags([
                                { type: tagTypes.calendar },
                            ]),
                        );
                    } else {
                        const state = getState();
                        const cacheEntries =
                            calendarApi.util.selectInvalidatedBy(state, [
                                { type: tagTypes.calendar },
                            ]);

                        // Loop through all matching cache entries and update each one
                        cacheEntries.forEach(({ queryCacheKey }) => {
                            const [, queryParams] = queryCacheKey.split('(');
                            const params = queryParams
                                ? JSON.parse(queryParams.slice(0, -1))
                                : undefined;

                            dispatch(
                                calendarApi.util.updateQueryData(
                                    'getMyEvents',
                                    params,
                                    (draft) => {
                                        // Add logic to determine if this event belongs in this particular query result
                                        // For example, check if the event's date matches the query's date range

                                        // Determine the correct structure based on your API response
                                        if (Array.isArray(draft)) {
                                            draft.push(
                                                createdEvent.event ||
                                                    createdEvent,
                                            );
                                        } else if (
                                            draft.events &&
                                            Array.isArray(draft.events)
                                        ) {
                                            draft.events.push(
                                                createdEvent.event ||
                                                    createdEvent,
                                            );
                                        }
                                    },
                                ),
                            );
                        });
                    }
                } catch (err) {
                    console.error(err);
                }
            },
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
            async onQueryStarted(args, { dispatch, queryFulfilled, getState }) {
                try {
                    const { data: createdEvent } = await queryFulfilled;
                    const state = getState();
                    const cacheEntries = calendarApi.util.selectInvalidatedBy(
                        state,
                        [{ type: tagTypes.calendar }],
                    );

                    cacheEntries.forEach(({ queryCacheKey }) => {
                        const [, queryParams] = queryCacheKey.split('(');
                        const params = queryParams
                            ? JSON.parse(queryParams.slice(0, -1))
                            : undefined;

                        dispatch(
                            calendarApi.util.updateQueryData(
                                'getMyEvents',
                                params,
                                (draft) => {
                                    if (
                                        draft.events &&
                                        Array.isArray(draft.events)
                                    ) {
                                        if (args.updateOption === 'thisEvent') {
                                            const newEvents = [...draft.events];
                                            const findIndex =
                                                newEvents.findIndex(
                                                    (e) => e._id === args.id,
                                                );
                                            if (findIndex !== -1) {
                                                newEvents[findIndex] =
                                                    createdEvent.event;
                                            }
                                            draft.events = newEvents;
                                        } else {
                                            dispatch(
                                                calendarApi.util.invalidateTags(
                                                    [
                                                        {
                                                            type: tagTypes.calendar,
                                                        },
                                                    ],
                                                ),
                                            );
                                        }
                                    }
                                },
                            ),
                        );
                    });
                } catch (err) {
                    console.error(err);
                }
            },
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
            async onQueryStarted(args, { dispatch, queryFulfilled, getState }) {
                try {
                    const { data: createdEvent } = await queryFulfilled;
                    const state = getState();
                    const cacheEntries = calendarApi.util.selectInvalidatedBy(
                        state,
                        [{ type: tagTypes.calendar }],
                    );
                    cacheEntries.forEach(({ queryCacheKey }) => {
                        const [, queryParams] = queryCacheKey.split('(');
                        const params = queryParams
                            ? JSON.parse(queryParams.slice(0, -1))
                            : undefined;

                        dispatch(
                            calendarApi.util.updateQueryData(
                                'getMyEvents',
                                params,
                                (draft) => {
                                    if (
                                        draft.events &&
                                        Array.isArray(draft.events)
                                    ) {
                                        if (args.deleteOption === 'thisEvent') {
                                            draft.events = draft.events.filter(
                                                (e: TEvent) =>
                                                    e._id !== args.id,
                                            );
                                        } else if (
                                            args.deleteOption ===
                                            'thisAndFollowing'
                                        ) {
                                            const deletedEvent =
                                                draft.events?.find(
                                                    (e) => e._id === args.id,
                                                );
                                            if (deletedEvent) {
                                                draft.events =
                                                    draft.events.filter(
                                                        (e) =>
                                                            e._id !== args.id &&
                                                            !(
                                                                e.seriesId ===
                                                                    deletedEvent.seriesId &&
                                                                dayjs(
                                                                    e.startTime,
                                                                ).isAfter(
                                                                    dayjs(
                                                                        deletedEvent.startTime,
                                                                    ),
                                                                )
                                                            ),
                                                    );
                                            }
                                        } else if (
                                            args.deleteOption === 'allEvents'
                                        ) {
                                            const deletedEvent =
                                                draft.events?.find(
                                                    (e) => e._id === args.id,
                                                );
                                            if (deletedEvent) {
                                                draft.events =
                                                    draft.events.filter(
                                                        (e) =>
                                                            e.seriesId !==
                                                                deletedEvent.seriesId &&
                                                            e._id !==
                                                                deletedEvent._id,
                                                    );
                                            }
                                        }
                                    }
                                },
                            ),
                        );
                    });
                } catch (err) {
                    console.error(err);
                }
            },
        }),

        updateInvitation: build.mutation({
            query: ({ id, data }: { id: string; data: any }) => ({
                url: `v2/calendar/event/invitation/response/${id}`,
                method: 'POST',
                data,
            }),
            invalidatesTags: [tagTypes.calendar],
        }),

        addNewSchedule: build.mutation({
            query: (name: string) => ({
                url: '/calendar/schedule/create',
                method: 'POST',
                data: { name },
            }),
            invalidatesTags: [tagTypes.schedules],
        }),

        getAllSchedules: build.query({
            query: () => ({
                url: '/calendar/schedule/all',
                method: 'GET',
            }),
            providesTags: [tagTypes.schedules],
        }),

        updateSchedule: build.mutation({
            query: ({
                scheduleId,
                payload,
            }: {
                scheduleId: string;
                payload: TUpdateSchedule;
            }) => ({
                url: `/calendar/schedule/update/${scheduleId}`,
                method: 'PATCH',
                data: payload,
            }),
            invalidatesTags: [tagTypes.schedules],
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
    useUpdateScheduleMutation,
    useAddNewScheduleMutation,
    useGetAllSchedulesQuery,
    useUpdateInvitationMutation,
} = calendarApi;
