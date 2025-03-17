import axios from 'axios';
import storage from '../../utils/storage';
import Cookies from 'js-cookie';

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
    const token = Cookies.get(
        process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME as string,
    );

    if (token) {
        config.headers['Authorization'] = `${token}`;
    }

    const enroll = await storage.getItem('active_enrolment');
    const enrollId = enroll?._id;

    if (enrollId) {
        config.headers['enrollment'] = enrollId;
    }
    // config.headers['enrollment'] = '6523d8d71eab265c60cf30ce';

    const selectedOrganization = Cookies.get('activeCompany');

    if (selectedOrganization) {
        config.headers['organization'] = `${selectedOrganization}`;
    }

    return config;
});

// Response interceptor
instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error),
);

export { instance };
