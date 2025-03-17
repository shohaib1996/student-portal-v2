import { baseApi } from '../baseApi';
import { tagTypes } from '../tagType/tagTypes';

const notificationApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllNotifications: build.query({
            query: () => ({
                url: '/notification/mynotifications',
                method: 'GET',
            }),
            providesTags: [tagTypes.notification],
        }),
        markAllRead: build.mutation({
            query: () => ({
                url: '/notification/markreadall',
                method: 'PATCH',
            }),
            invalidatesTags: [tagTypes.notification],
        }),
        markRead: build.mutation({
            query: (id: string) => ({
                url: `/notification/markread/${id}`,
                method: 'PATCH',
                data: { opened: true },
            }),
            invalidatesTags: [tagTypes.notification],
        }),
    }),
});

export const {
    useGetAllNotificationsQuery,
    useMarkAllReadMutation,
    useMarkReadMutation,
} = notificationApi;

export default notificationApi;
