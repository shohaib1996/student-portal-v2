// redux/features/selectionModalSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectionModalState {
    isOpen: boolean;
    activeView: 'university' | 'course';
    selectedUniversityId: string | null;
    selectedCourseId: string | null;
}

const initialState: SelectionModalState = {
    isOpen: false,
    activeView: 'university',
    selectedUniversityId: null,
    selectedCourseId: null,
};

const selectionModalSlice = createSlice({
    name: 'selectionModal',
    initialState,
    reducers: {
        openModal: (state, action: PayloadAction<'university' | 'course'>) => {
            state.isOpen = true;
            state.activeView = action.payload;
        },
        closeModal: (state) => {
            state.isOpen = false;
            state.selectedUniversityId = null;
            state.selectedCourseId = null;
        },
        switchView: (state, action: PayloadAction<'university' | 'course'>) => {
            state.activeView = action.payload;
        },
        setSelectedUniversity: (state, action: PayloadAction<string>) => {
            state.selectedUniversityId = action.payload;
        },
        setSelectedCourse: (state, action: PayloadAction<string>) => {
            state.selectedCourseId = action.payload;
        },
    },
});

export const {
    openModal,
    closeModal,
    switchView,
    setSelectedUniversity,
    setSelectedCourse,
} = selectionModalSlice.actions;
export default selectionModalSlice.reducer;
