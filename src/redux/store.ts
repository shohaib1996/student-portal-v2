import { configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';
import { reducer, middleware } from './rootReducer';

export const store = configureStore({
    reducer,
    middleware,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
