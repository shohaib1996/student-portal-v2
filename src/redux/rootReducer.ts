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
import communityReducer from './features/communityReducer';
import ChatReducer from './features/chatReducer';
import comapnyReducer from './features/comapnyReducer';
import notificationReducer from './features/notificationReducer';
import navigationReducer from './features/navigationReducer';
import programReducer from './features/programReducer';
import calendarReducer from './features/calendarReducer';
import selectionModalReducer from './features/selectionModalSlice';
import tableReducer from './features/tableReducer';
import localforage from 'localforage';

const getStorage = () => {
    if (typeof window !== 'undefined') {
        try {
            localforage.config({
                driver: localforage.INDEXEDDB,
                name: 'orbittask-project',
            });
            return localforage;
        } catch (error) {
            console.warn(
                'IndexedDB is not available. Falling back to local storage.',
            );
            return createWebStorage('local'); // Returns an object matching redux-persist's storage API
        }
    }
    return createWebStorage('local'); // SSR fallback
};

const storage = getStorage();

// Persist configuration for auth reducer
const authPersistConfig = {
    key: 'auth',
    storage, // Use the appropriate storage
};

const chatPersistConfig = {
    key: 'chat',
    storage,
};

// Persisted auth reducer
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedChatReducer = persistReducer(chatPersistConfig, ChatReducer);

const tablePersistConfig = {
    key: 'table',
    storage,
};

// Combine reducers
export const reducer = {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: persistedAuthReducer,
    community: communityReducer,
    chat: persistedChatReducer,
    company: comapnyReducer,
    notification: notificationReducer,
    navigations: navigationReducer,
    program: programReducer,
    calendar: calendarReducer,
    selectionModal: selectionModalReducer,
    table: persistReducer(tablePersistConfig, tableReducer),
};

// Middleware configuration
export const middleware = (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
    }).concat(baseApi.middleware);
