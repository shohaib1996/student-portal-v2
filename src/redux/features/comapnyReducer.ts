import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for the state
interface Company {
    [key: string]: any;
}

interface CompanyState {
    activeCompany: Company | null;
    companies: Company[];
    companySwitcher: boolean;
    features: any[];
}

const initialState: CompanyState = {
    activeCompany: null,
    companies: [],
    companySwitcher: false,
    features: [],
};

const companySlice = createSlice({
    name: 'company',
    initialState,
    reducers: {
        setActiveCompany: (state, action: PayloadAction<Company>) => {
            state.activeCompany = action.payload;
            localStorage.setItem(
                'activeCompany',
                JSON.stringify(action.payload),
            );
        },
        setCompanies: (state, action: PayloadAction<Company[]>) => {
            state.companies = action.payload;
        },
        setCompanySwitcher: (state, action: PayloadAction<boolean>) => {
            state.companySwitcher = action.payload;
        },
        setCompanyFeatures: (state, action: PayloadAction<any[]>) => {
            state.features = action.payload;
        },
    },
});

export const {
    setActiveCompany,
    setCompanies,
    setCompanySwitcher,
    setCompanyFeatures,
} = companySlice.actions;

export default companySlice.reducer;
