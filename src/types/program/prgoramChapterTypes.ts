export enum ChapterType {
    CHAPTER = 'chapter',
    LESSON = 'lesson',
}

export enum LessonType {
    VIDEO = 'video',
    Quiz = 'quiz',
}

export type TLessonInfo = {
    type: LessonType.Quiz | LessonType.VIDEO;
    isFree: boolean;
    duration?: string | number | undefined;
    _id: string;
    data?: {
        behavioral: string;
        implementation: string;
        interview: string;
        summary: string;
        transcription: string;
    };
    title: string;
    url: string | null;
    createdAt: string;
    updatedAt: string;
};

export type TLesson = {
    _id: string;
    type: ChapterType.LESSON;
    lesson: TLessonInfo;
    priority: number;
    createdAt?: string;
    myCourse: TMyCourse;
    isPinned: boolean;
    isCompleted: boolean;
    isFocused: boolean;
    isLocked: boolean;
    isSpecial: boolean;
    duration: number;
    courseId?: string;
    children?: TLesson[]; // Updated to include nested children
};

export type TChapterInfo = {
    name: string;
    description: string | null;
    subTitle: string | null;
    subDescription: string | null;
    image: string;
    isFree: boolean;
    updatedAt?: string;
    createdAt?: string;
    _id?: string;
    children?: TContent[]; // Updated to include nested children
};

export type TMyCourse = {
    course: string;
    isOwner: boolean;
    parent: string;
    groups: string[];
    prev: string;
    isPublished: boolean;
    category: string;
    isPreview: boolean;
    sessions: string[];
    _id?: string;
};

export type TChapter = {
    _id: string;
    type: ChapterType.CHAPTER;
    chapter: TChapterInfo;
    priority: number;
    myCourse: TMyCourse;
    isPinned: boolean;
    isCompleted: boolean;
    isFocused: boolean;
    isLocked: boolean;
    isSpecial: boolean;
    createdAt?: string;
    lesson?: string;
    courseId?: string;
    children?: TContent[]; // Updated to include nested children
};

export type TContent = TChapter | TLesson;

export type TChaptersResponse = {
    chapters: TContent[];
    success: boolean;
};

export interface Interview {
    success: boolean;
    interview: {
        _id: string;
    };
    questions: Question[];
}

interface Question {
    question: string;
    options: Option[];
}

interface Option {
    option: string;
}

export interface AnswerPayload {
    answers: Answer[];
    source: string;
    course: string;
}

interface Answer {
    question: string;
    options: AnswerOption[];
}

interface AnswerOption {
    option: string;
    isAnswered?: boolean;
}
