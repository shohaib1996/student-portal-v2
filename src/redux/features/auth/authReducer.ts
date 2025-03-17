import { TUser } from '@/types/auth';
import { createSlice } from '@reduxjs/toolkit';

type TInitialState = {
    user: TUser | null;
    isAuthenticated: boolean;
    enrollment: null | string;
    myEnrollments: any[];
};

const initialState: TInitialState = {
    user: null,
    isAuthenticated: false,
    enrollment: null,
    myEnrollments: [],
};
export const authSlice = createSlice({
    name: 'authSlice',
    initialState: initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },
        setEnrollment: (state, action) => {
            state.enrollment = action.payload;
        },
        setMyEnrollments: (state, action) => {
            state.myEnrollments = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setUser, updateUser, setEnrollment, setMyEnrollments, logout } =
    authSlice.actions;

export default authSlice.reducer;
