import React, { JSX } from 'react';

interface User {
    fullName?: string;
}

interface Activity {
    type?: 'add' | 'remove' | 'join' | 'leave';
    user?: User;
}

interface Message {
    sender?: User;
    activity?: Activity;
}

export const generateActivityText = (message: Message): JSX.Element => {
    const activity = message.activity;

    if (!activity || !activity.type) {
        return React.createElement(React.Fragment, null, 'N/A');
    }

    if (activity.type === 'add') {
        return React.createElement(
            React.Fragment,
            null,
            React.createElement('b', null, message.sender?.fullName),
            ' ',
            React.createElement(
                'strong',
                { style: { color: '#17855F' } },
                'added',
            ),
            ' ',
            React.createElement('b', null, activity.user?.fullName),
        );
    }

    if (activity.type === 'remove') {
        return React.createElement(
            React.Fragment,
            null,
            React.createElement('b', null, message.sender?.fullName),
            ' ',
            React.createElement(
                'strong',
                { style: { color: '#F42A41' } },
                'removed',
            ),
            ' ',
            React.createElement('b', null, activity.user?.fullName),
        );
    }

    if (activity.type === 'join') {
        return React.createElement(
            React.Fragment,
            null,
            React.createElement('b', null, activity.user?.fullName),
            ' ',
            React.createElement(
                'strong',
                { style: { color: '#17855F' } },
                'joined',
            ),
            ' in this group',
        );
    }

    if (activity.type === 'leave') {
        return React.createElement(
            React.Fragment,
            null,
            React.createElement('b', null, activity.user?.fullName),
            ' ',
            React.createElement(
                'strong',
                { style: { color: '#F42A41' } },
                'left',
            ),
            ' this group',
        );
    }

    return React.createElement(React.Fragment, null, 'N/A');
};
