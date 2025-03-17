export type TEventNotification = {
    type: string;
    label: string;
    value: number;
};

export type TNotification = {
    chatGroups: string[];
    methods: ('push' | 'inbox' | 'groups' | 'text' | 'email')[];
    timeBefore: number;
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
    _id: string; // Assuming it's a string representation of an ObjectId
    repeatDays?: {
        repeatDays: TWeeks[];
        turnOn: boolean;
        repeatPeriod: 'week' | 'day' | 'month';
    }; // Adjust based on the actual data structure
    turnOn: boolean;
    timeRange: TTimeRange;
    eventType: TCalendarEventType;
    invitations?: [];
    repeatPeriod: string; // Example: "week"
    isAllDay: boolean;
    meetingLink: string;
    actionItems: string;
    followUp: string; // Assuming HTML string
    attachments?: any[]; // Adjust type based on attachment structure
    title: string;
    timeZone?: string;
    start: string; // ISO 8601 date string
    end: string; // ISO 8601 date string
    createdBy: TParticipentUser; // User ID as string
    createdAt: string; // ISO 8601 date string
    updatedAt: string; // ISO 8601 date string
    participants: Participant[];
    agenda: string;
    pinned: boolean;
    myParticipantData: {
        user: string;
        status: 'accepted' | 'pending' | 'denied' | 'canceled'; // Add more statuses if applicable
        _id?: string;
    };
    ref?: {
        source: TCalendarRefSource;
        id: string;
    };
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
