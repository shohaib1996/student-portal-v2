import axios from 'axios';
import CookiesHandler from './CookiesHandler';

// Axios instance setup
const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Separate instance for refreshing tokens
export const refreshInstance = axios.create({
    withCredentials: true,
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 60000,
});

// Request interceptor
instance.interceptors.request.use(async (config) => {
    const accessToken = await CookiesHandler(
        'get',
        process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME as string,
    );
    const enrollment = await CookiesHandler('get', 'enrollment');
    const organization = await CookiesHandler(
        'get',
        process.env.NEXT_PUBLIC_AUTH_ACTIVE_COMPANY_NAME as string,
    );

    if (accessToken?.value) {
        config.headers['Authorization'] = `${accessToken.value}`;
    }

    if (enrollment?.value) {
        config.headers['enrollment'] = `${enrollment.value}`;
    }

    if (organization?.value) {
        config.headers['organization'] = `${organization.value}`;
    }

    return config;
});

// Response interceptor
instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error),
);

export { instance };
