import { TUser } from '../../../types/auth';

export type TEventNotification = {
    type: string;
    label: string;
    value: number;
};

export type TNotification = {
    crowds: string[];
    methods: ('email' | 'push' | 'text' | 'directMessage' | 'crowds')[];
    offsetMinutes: number;
};

export type TWeeks = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export type TRepeatDays = 1 | 2 | 3 | 4 | 5 | 6 | 0;

export type TTimeRange = {
    disabledEditTimeRange?: boolean;
    turnOn: boolean;
    repeatIteration: number;
    repeatPeriod: string;
    repeatDays: TRepeatDays[];
};

interface ProposedTime {
    start?: Date;
    end?: Date;
}

interface UserInfo {
    fullName?: string;
    phone?: string;
    email?: string;
    answers?: any[]; // Adjust type based on the expected data structure of `answers`
}

export type TParticipentUser = {
    _id?: string | undefined; // Assuming it's a string representation of an ObjectId
    profilePicture?: string | undefined; // URL to the profile picture
    email?: string | undefined;
    lastName?: string | undefined;
    firstName?: string | undefined;
    fullName?: string | undefined;
    participantId?: string;
};

export interface Participant {
    _id: string;
    user: TParticipentUser; // Reference to the User_v2 model
    status?: TCalendarEventStatus | 'finished';
    addedAt?: Date;
    proposedTime?: ProposedTime;
    userInfo?: UserInfo;
}

export type TCalendarEventStatus =
    | 'accepted'
    | 'pending'
    | 'proposedTime'
    | 'denied'
    | 'canceled';

// Type for event types
export type TCalendarEventType =
    | 'showNTell'
    | 'mockInterview'
    | 'orientation'
    | 'technicalInterview'
    | 'behavioralInterview'
    | 'reviewMeeting'
    | 'syncUp'
    | 'other';

export type TCalendarRefSource =
    | 'test-case-template'
    | 'shared-parameters'
    | 'test-strategy'
    | 'test-plan'
    | 'suite'
    | 'test-configuration'
    | 'test-configuration-variable'
    | 'sprint'
    | 'work-item'
    | 'wiki'
    | 'retro'
    | 'query-builder'
    | 'teamAndGroup'
    | 'tools-validators'
    | 'api'
    | 'issuetypescheme_v2'
    | 'testResult'
    | 'chat'
    | 'calendar'
    | 'testRun';

export type TNewEventData = {
    isFetching?: boolean;
    isOpen: boolean;
    isEventCreateInitialize: boolean;
    isAllDay: boolean;
    type?: 'event' | 'task';
    title: string;
    meetingLink: string;
    eventType: string;
    agenda: string;
    followUp: string;
    actionItems: string;
    eventColor?: string;
    program?: string;
    session?: string;
    startDateTime: string;
    monthIndex?: number | null | undefined;
    endDateTime: string;
    date: Date | number | null;
    invitations: TParticipentUser[] | [];
    participants?: Participant[];
    users?: string[];
    notifications: TNotification[];
    timeRange: TTimeRange;
    timeZone: string;
    updateEventId: string | null;
    ref: {
        source: TCalendarRefSource;
        id: string;
    };
};

export type TCalendarInitialState = {
    selectedDate: string;
    currentDate: string;
    eventLoading: boolean;
    monthIndex: number;
    auth: object;
    availability: boolean;
    date: number;
    upcommingEvents: any[]; // Change `any` to the specific event type if defined
    programs: any[]; // Change `any` to the specific program type if defined
    sessions: any[]; // Change `any` to the specific session type if defined
    holidays: any[]; // Change `any` to the specific holiday type if defined
    smallCalendarMonth: number;
    newEventData: TNewEventData;
    filterEvents: TCalendarEventStatus[];
    eventTypes: TCalendarEventType[];
};

export type TEvent = {
    _id: string;
    title: string;
    description?: string;
    location?: {
        type: 'meet' | 'zoom' | 'call' | 'custom';
        link?: string;
    };
    isAllDay?: boolean;
    seriesId?: string;
    timeZone?: string;
    startTime: string; // ISO 8601 format
    endTime: string; // ISO 8601 format
    eventColor?: string;
    recurrence?: {
        isRecurring: boolean;
        frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
        interval: number;
        daysOfWeek?: number[]; // 1 = Monday, 7 = Sunday
        endRecurrence: string; // ISO 8601 format
    };
    attendees?: {
        responseStatus: 'accepted' | 'needsAction' | 'denied' | 'finished';
        user?: TUser;
    }[];
    organizer?: TUser;
    reminders?: {
        method: 'email' | 'push' | 'text' | 'directMessage' | 'crowds';
        offsetMinutes: number;
    }[];
    priority?: 'low' | 'medium' | 'high';
    attachments?: {
        name: string;
        type: string;
        size: number;
        url: string;
    }[];
    purpose?: {
        category: string;
        resourceId: string;
    };
    type: 'event' | 'task';
    permissions?: {
        modifyEvent?: boolean;
        inviteOthers?: boolean;
        seeGuestList?: boolean;
    };
    myParticipantData: {
        user: string;
        status: 'accepted' | 'pending' | 'denied' | 'canceled'; // Add more statuses if applicable
        _id?: string;
    };
    attendeeCount?: number;
    myResponseStatus?: 'accepted' | 'needsAction' | 'denied' | 'finished';
    status: 'todo' | 'inprogress' | 'completed' | 'cancelled';
};

export type TInterval = {
    _id?: string;
    from: string; // Time in "HH:mm" format
    to: string; // Time in "HH:mm" format
};

export type TAvailability = {
    _id: string;
    type: 'wady' | 'date'; // Either "wady" for weekly day or "date" for specific date
    intervals: TInterval[];
    wday?: string; // Only for "wady", e.g., "sunday", "monday"
    date?: string; // Only for "date", ISO date string
};

export type TSchedule = {
    _id: string;
    name: string;
    availability: TAvailability[];
    timeZone: string; // Timezone in IANA format, e.g., "Asia/Dhaka"
    createdBy: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    __v: number;
};

export type THistory = {
    _id: string;
    updatedAt: string;
    user: TParticipentUser;
    diff: Record<string, Record<'oldValue' | 'newValue', string>>;
    version: number;
    createdAt: string;
};

export type TUpdateSchedule = {
    availability: TAvailability[];
    name: string;
    timeZone: string;
};
