import createWebStorage from 'redux-persist/es/storage/createWebStorage';
import authReducer from './features/auth/authReducer';
import {
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import { baseApi } from './api/baseApi';

// Create a noop storage for SSR
const createNoopStorage = () => {
    return {
        getItem: async () => null,
        setItem: async () => {},
        removeItem: async () => {},
    };
};

// Create storage based on the environment
const storage =
    typeof window !== 'undefined'
        ? createWebStorage('local')
        : createNoopStorage();

// Persist configuration for auth reducer
const authPersistConfig = {
    key: 'auth',
    storage, // Use the appropriate storage
};

// Persisted auth reducer
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// Combine reducers
export const reducer = {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: persistedAuthReducer,
};

// Middleware configuration
export const middleware = (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
    }).concat(baseApi.middleware);
