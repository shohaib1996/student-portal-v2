export enum ChapterType {
    CHAPTER = 'chapter',
    LESSON = 'lesson',
}

export enum LessonType {
    VIDEO = 'video',
}

export type TLessonInfo = {
    type: LessonType;
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
};

export type TContent = TChapter | TLesson;

export type TChaptersResponse = {
    chapters: TContent[];
    success: boolean;
};
