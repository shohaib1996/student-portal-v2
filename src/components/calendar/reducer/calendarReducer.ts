import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type TInitialState = {
    eventFilter: (
        | 'accepted'
        | 'pending'
        | 'denied'
        | 'finished'
        | 'proposedTime'
    )[];
    todoFilter: (
        | 'confirmed'
        | 'cancelled'
        | 'todo'
        | 'inprogress'
        | 'completed'
    )[];
    typeFilter?: 'task' | 'event';
    holidayFilter: string[];
    rolesFilter: ('organizer' | 'attendee')[];
    priorityFilter: ('low' | 'medium' | 'high')[];
    currentDate: Date | null;
    query: string;
};

const initialState: TInitialState = {
    eventFilter: [],
    todoFilter: [],
    holidayFilter: [],
    rolesFilter: [],
    typeFilter: undefined,
    priorityFilter: [],
    currentDate: null,
    query: '',
};

const calendarSlice = createSlice({
    name: 'calendar',
    initialState,
    reducers: {
        setEventFilter: (
            state,
            action: PayloadAction<TInitialState['eventFilter']>,
        ) => {
            state.eventFilter = action.payload;
            if (action.payload.length > 0) {
                if (!state.rolesFilter.includes('attendee')) {
                    state.rolesFilter.push('attendee');
                }
            } else {
                state.rolesFilter = state.rolesFilter.filter(
                    (r) => r !== 'attendee',
                );
            }
        },
        setTodoFilter: (
            state,
            action: PayloadAction<TInitialState['todoFilter']>,
        ) => {
            state.todoFilter = action.payload;
        },
        setTypeFilter: (
            state,
            action: PayloadAction<TInitialState['typeFilter']>,
        ) => {
            state.typeFilter = action.payload;
        },
        setHolidayFilter: (state, action: PayloadAction<string[]>) => {
            state.holidayFilter = action.payload;
        },
        setRolesFilter: (
            state,
            action: PayloadAction<('organizer' | 'attendee')[]>,
        ) => {
            state.rolesFilter = action.payload;
        },
        setPriorityFilter: (
            state,
            action: PayloadAction<('low' | 'medium' | 'high')[]>,
        ) => {
            state.priorityFilter = action.payload;
        },
        setCurrentDate: (state, action: PayloadAction<Date | null>) => {
            state.currentDate = action.payload;
        },
        resetFilters: (state) => {
            state.eventFilter = [];
            state.todoFilter = [];
            state.holidayFilter = [];
            state.rolesFilter = [];
            state.priorityFilter = [];
        },
        setEventQuery: (state, action: PayloadAction<string>) => {
            state.query = action.payload;
        },
    },
});

export const {
    setEventFilter,
    setTodoFilter,
    setHolidayFilter,
    setRolesFilter,
    setPriorityFilter,
    setCurrentDate,
    setTypeFilter,
    resetFilters,
    setEventQuery,
} = calendarSlice.actions;

export default calendarSlice.reducer;
