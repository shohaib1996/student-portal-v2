import axios from 'axios';
import { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/redux/store';
import { toast } from 'sonner';
import { setNavigation } from '@/redux/features/navigationReducer';
import {
    setNotifications,
    setUnReadNotification,
} from '@/redux/features/notificationReducer';
import {
    setCourses,
    setPrograms,
    setServices,
} from '@/redux/features/programReducer';
import {
    setPostLoading,
    setPosts,
    setTotalPages,
    setTotalPosts,
} from '@/redux/features/communityReducer';
import { instance } from '@/lib/axios/axiosInstance';
import { setChats, setOnlineUsers } from '@/redux/features/chatReducer';

// Define ThunkAction type for all action creators
type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    AnyAction
>;

// Types
interface GetCommunityPostsParams {
    limit: number;
    activePage: number;
    reset?: boolean;
    query?: string;
    user?: string;
    filter?: string;
    tags?: string[];
}

// export const getCompanies = (): AppThunk => {
//   return (dispatch) => {
//     axios.get("/organization/user-organizations")
//       .then(res => {
//         dispatch(setCompanies(res.data.organizations || []));
//       }
//       )
//       .catch(err => {
//         console.error(err);
//         notification.error({ message: err?.response?.data?.error });
//       }
//       )
//   }
// }

export const loadChats = (): AppThunk => {
    return async (dispatch) => {
        try {
            const res = await instance.get('/chat/mychats');
            dispatch(setChats(res.data.chats));
        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.error);
        }
    };
};

export const loadNotifications = (): AppThunk => {
    return (dispatch) => {
        instance
            .get('/notification/mynotifications')
            .then((res) => {
                dispatch(setNotifications(res.data.notifications));
                dispatch(setUnReadNotification(res.data.totalUnread));
            })
            .catch((err) => {
                console.error(err);
                toast.error(err?.response?.data?.error);
            });
    };
};

export const getOnlines = (): AppThunk => {
    return (dispatch) => {
        instance
            .get('/user/online')
            .then((res) => {
                dispatch(setOnlineUsers(res.data.users));
            })
            .catch((err) => {
                console.error(err);
                toast.error(err?.response?.data?.error);
            });
    };
};

export const getMyNavigations = (): AppThunk => {
    return (dispatch) => {
        instance
            .get('/navigation/mynavigations')
            .then((res) => {
                dispatch(setNavigation(res.data.navigation?.navigations));
            })
            .catch((err) => {
                console.error(err);
                toast.error(err?.response?.data?.error);
            });
    };
};

export const myMeetings = (): void => {
    // This function doesn't return anything now
    // If you uncomment the code below, make sure to add the return type AppThunk
    // return (dispatch) => {
    //     axios.get('/meeting/mymeetings')
    //         .then(res => {
    //             dispatch({
    //                 type:'SET_MEETINGS',
    //                 payload:res.data.meetings
    //             })
    //         })
    //         .catch(err => {
    //             console.error(err);
    //             toast.error(err?.response?.data?.error)
    //         })
    // }
};

// export const getPrograms = (): AppThunk => {
//     return (dispatch) => {
//         instance
//             .get('/course/get?type=program')
//             .then((res) => {
//                 dispatch(setPrograms(res.data.courses));
//             })
//             .catch((err) => {
//                 console.error(err);
//                 toast.error(err?.response?.data?.error);
//             });
//     };
// };

// export const getCourses = (): AppThunk => {
//     return (dispatch) => {
//         instance
//             .get('/course/get?type=course')
//             .then((res) => {
//                 dispatch(setCourses(res.data.courses));
//             })
//             .catch((err) => {
//                 console.error(err);
//                 toast.error(err?.response?.data?.error);
//             });
//     };
// };

// export const getServices = (): AppThunk => {
//     return (dispatch) => {
//         instance
//             .get('/course/get?type=professional-service')
//             .then((res) => {
//                 dispatch(setServices(res.data.courses));
//             })
//             .catch((err) => {
//                 console.error(err);
//                 toast.error(err?.response?.data?.error);
//             });
//     };
// };

export const getCommunityPosts = ({
    limit,
    activePage,
    reset = false,
    query = '',
    user = '',
    filter = '',
    tags = [],
}: GetCommunityPostsParams): AppThunk => {
    return (dispatch) => {
        dispatch(setPostLoading(true));
        instance
            .post(`/content/community/post/getall`, {
                page: activePage,
                limit: limit,
                query: query,
                tags: tags,
                user: user,
                filterBy: filter,
            })
            .then((res) => {
                dispatch(setPosts({ posts: res.data.posts, reset: reset }));
                dispatch(setTotalPosts(res.data.count));
                dispatch(setPostLoading(false));
                dispatch(setTotalPages(Math.ceil(res.data.count / limit)));
            })
            .catch((err) => {
                console.error(err);
                dispatch(setPostLoading(false));
                toast.error(err?.response?.data?.error);
            });
    };
};
