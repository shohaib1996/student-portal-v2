import { TUser } from '../auth';

export interface Program {
    _id: string;
    title: string;
}

export interface IContentt {
    description: string;
    category: string;
    tags: string[];
    programs: string[];
    sessions: string[];
    courses: string[];
    dependencies: string[];
    attachments: string[];
    groups: string[];
    isFree: boolean;
    isPublished: boolean;
    branches: string[];
    _id: string;
    name: string;
    slide: TSlide;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    organization: string;
}

export interface Session {
    _id: string;
    name: string;
}

type Slide = {
    _id: string;
    content: string;
    title: string;
};

export type TSlide = {
    _id: string;
    title: string;
    programs: Program[];
    sessions: Session[];
    branches: string[];
    slides: Slide[];
    createdBy: TUser;
    organization: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
};

export interface ISlideContent {
    _id: string;
    content: string;
    title: string;
}

export interface ISlideApiResponse {
    success: boolean;
    content: IContentt;
}
