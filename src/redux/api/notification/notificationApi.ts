import { socket } from '@/helper/socketManager';
import { baseApi } from '../baseApi';
import { tagTypes } from '../tagType/tagTypes';

const notificationApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllNotifications: build.query({
            query: (params?: any) => ({
                url: '/notification/mynotifications',
                method: 'GET',
                params,
            }),
            providesTags: [tagTypes.notification],
            async onCacheEntryAdded(
                arg,
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
            ) {
                try {
                    await cacheDataLoaded;

                    if (!socket) {
                        return;
                    }

                    // Setup socket listener for new notifications
                    const handleNewNotification = (data: any) => {
                        if (
                            data?.notification?.categories?.includes(
                                'student',
                            ) ||
                            data?.notification?.categories?.includes('global')
                        ) {
                            updateCachedData((draft) => {
                                draft.unshift(data.notification);
                            });
                        }
                    };

                    // Register event listener
                    socket.on('newnotification', handleNewNotification);

                    // Clean up on unmount
                    await cacheEntryRemoved;
                    socket.off('newnotification', handleNewNotification);
                } catch (err) {
                    console.error('Error in notification socket setup:', err);
                }
            },
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
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    notificationApi.util.updateQueryData(
                        'getAllNotifications',
                        undefined,
                        (draft) => {
                            // Find the specific notification and update its status
                            const notification = draft.find(
                                (n: any) => n._id === id,
                            );
                            if (notification) {
                                notification.opened = true;
                            }
                        },
                    ),
                );

                try {
                    await queryFulfilled;
                } catch {
                    // If the API call fails, revert the optimistic update
                    patchResult.undo();
                }
            },
        }),
    }),
});

export const {
    useGetAllNotificationsQuery,
    useMarkAllReadMutation,
    useMarkReadMutation,
} = notificationApi;

export default notificationApi;
