import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: {},
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
            state.user = {};
            state.isAuthenticated = false;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setUser, updateUser, setEnrollment, setMyEnrollments, logout } =
    authSlice.actions;

export default authSlice.reducer;
