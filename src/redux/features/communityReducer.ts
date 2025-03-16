import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { getCommunityPosts } from '../../actions/initialActions';

// Define interfaces for the state and other objects
interface Post {
    _id: string;
    myReaction?: string;
    reactionsCount?: number;
    reactions?: any[];
    commentsCount?: number;
    [key: string]: any; // For other properties that may be in a post
}

interface CommunityState {
    posts: Post[];
    totalPosts: number;
    postLoading: boolean;
    limit: number;
    activePage: number;
    contributors: any[];
    user: string;
    query: string;
    editPost: boolean;
    editPostId: string;
    queryTags: string[];
    filter: string;
    totalPage: number;
}

interface SetPostsPayload {
    posts: Post[];
    reset: boolean;
}

interface ReactPayload {
    _id: string;
    myReaction: string;
    reactionsCount: number;
    reactions: any[];
}

interface CommentCountPayload {
    id: string;
    count: number;
}

interface EditPostPayload {
    id?: string;
    edit: boolean;
}

interface UpdatePostPayload {
    label: string;
    value: any;
    id: string;
}

const initialState: CommunityState = {
    posts: [],
    totalPosts: 0,
    postLoading: false,
    limit: 10,
    activePage: 1,
    contributors: [],
    user: '',
    query: '',
    editPost: true,
    editPostId: '',
    queryTags: [],
    filter: '',
    totalPage: 1,
};

const communitySlice = createSlice({
    name: 'community',
    initialState,
    reducers: {
        setPosts: (state, action: PayloadAction<SetPostsPayload>) => {
            if (action.payload.reset === true) {
                state.posts = action.payload.posts;
            } else {
                action.payload.posts.forEach((post) => {
                    const exist = state.posts.find((p) => p._id === post._id);
                    if (!exist) {
                        state.posts.push(post);
                    }
                });
            }
        },
        setTotalPosts: (state, action: PayloadAction<number>) => {
            state.totalPosts = action.payload;
        },
        setReact: (state, action: PayloadAction<ReactPayload>) => {
            const post = state.posts.find((p) => p._id === action.payload._id);
            if (post) {
                post.myReaction = action.payload.myReaction;
                post.reactionsCount = action.payload.reactionsCount;
                post.reactions = action.payload.reactions;
            }
        },
        setCommentCount: (
            state,
            action: PayloadAction<CommentCountPayload>,
        ) => {
            const post = state.posts.find((p) => p._id === action.payload.id);
            console.log(action.payload);
            console.log(post);
            if (post && action.payload) {
                post.commentsCount = action.payload.count;
            }
        },
        setPostLoading: (state, action: PayloadAction<boolean>) => {
            state.postLoading = action.payload;
        },
        setTotalPages: (state, action: PayloadAction<number>) => {
            state.totalPage = action.payload;
        },
        setContributors: (state, action: PayloadAction<any[]>) => {
            state.contributors = action.payload;
        },
        setQuery: (state, action: PayloadAction<string>) => {
            state.query = action.payload;
        },
        setSeachedUser: (state, action: PayloadAction<string>) => {
            state.user = action.payload;
        },
        setEditPost: (state, action: PayloadAction<EditPostPayload>) => {
            if (action.payload.id) {
                state.editPostId = action.payload.id;
            }
            state.editPost = action.payload.edit;
        },
        setQueryTags: (state, action: PayloadAction<string>) => {
            if (action.payload === 'reset') {
                state.queryTags = [];
            } else {
                const exist = state.queryTags.find((t) => t === action.payload);
                if (!exist) {
                    getCommunityPosts({
                        limit: 10,
                        activePage: 1,
                        reset: true,
                        query: state.query,
                        tags: [...state.queryTags, action.payload],
                    });
                    state.queryTags = [...state.queryTags, action.payload];
                }
            }
        },
        setActivePage: (state, action: PayloadAction<number>) => {
            state.activePage = action.payload;
        },
        removeQueryTag: (state, action: PayloadAction<string>) => {
            state.queryTags = state.queryTags.filter(
                (t) => t !== action.payload,
            );
        },
        updatePost: (state, action: PayloadAction<UpdatePostPayload>) => {
            const { label, value, id } = action.payload;
            console.log(action.payload);
            console.log(label, value, id);
            const post = state.posts.find((p) => p._id === id);
            if (post) {
                state.posts[state.posts.indexOf(post)][label] = value;
            }
        },
        setFilter: (state, action: PayloadAction<string>) => {
            state.filter = action.payload;
        },
    },
});

export const {
    setSeachedUser,
    setPosts,
    setTotalPosts,
    setTotalPages,
    setReact,
    setCommentCount,
    setPostLoading,
    setContributors,
    setQuery,
    setEditPost,
    setQueryTags,
    removeQueryTag,
    updatePost,
    setFilter,
    setActivePage,
} = communitySlice.actions;

export default communitySlice.reducer;
