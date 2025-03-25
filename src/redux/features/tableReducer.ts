import { TCustomColumnDef } from '@/components/global/GlobalTable/GlobalTable';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ColumnSizingState } from '@tanstack/react-table';

type TTableSizeData = {
    tableName: string;
    columnSizing: ColumnSizingState;
    columns: TCustomColumnDef<any>[] | [];
};

type TInitialState = {
    tableSizeData: TTableSizeData[];
};

const initialState: TInitialState = {
    tableSizeData: [],
};

const tableSlice = createSlice({
    name: 'table',
    initialState,
    reducers: {
        setColumnSizing: (state, action: PayloadAction<TTableSizeData>) => {
            const exist = state.tableSizeData.find(
                (d) => d.tableName === action.payload.tableName,
            );

            if (exist) {
                exist.columnSizing = action.payload.columnSizing;
                exist.columns = action.payload.columns;
            } else {
                state.tableSizeData.push({ ...action.payload });
            }
        },
    },
});

export const { setColumnSizing } = tableSlice.actions;
export default tableSlice.reducer;
