import { instance } from '@/lib/axios/axiosInstance';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const TopbarRoutes = () => {
    const [navigations, setNavigations] = useState([]);
    useEffect(() => {
        instance
            .get('/navigation/mynavigations')
            .then((res) => {
                setNavigations(res.data.navigation.navigations);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    const routes = [
        {
            name: 'Dashboard',
            route: '/dashboard',
        },
        {
            name: 'My Program',
            route: '/dashboard/program',
        },
        {
            name: 'My E2E Program Agenda',
            route: '/dashboard/e2e-program-agenda',
        },
        {
            name: 'My Purchased Item',
            route: '/dashboard/program/my-purchased-items',
        },
        {
            name: 'Audio/Video',
            route: '/dashboard/audio-video',
        },
        {
            name: 'Show n Tell',
            route: '/dashboard/show-n-tell',
        },
        {
            name: 'Leaderboard',
            route: '/dashboard/program/leaderboard',
        },
        {
            name: 'My Documents',
            route: '/dashboard/my-documents',
        },
        {
            name: 'My Uploaded Documents',
            route: '/dashboard/upload-documents',
        },
        {
            name: 'Calendar',
            route: '/dashboard/calendar',
        },
        {
            name: 'Payment',
            route: '/dashboard/payment-history',
        },
        {
            name: 'Community',
            route: '/dashboard/community',
        },
        {
            name: 'Template',
            route: '/dashboard/my-templates',
        },
        {
            name: 'Help Center',
            route: '/dashboard/help-center',
        },
    ];
    return routes;
};

export default TopbarRoutes;
