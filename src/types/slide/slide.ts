import { TUser } from '../auth';

export interface Program {
    _id: string;
    title: string;
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
