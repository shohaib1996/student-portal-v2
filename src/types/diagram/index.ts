import { TUser } from '../auth';

export interface DiagramType {
    attachments?: string[];
    description: string[];
    programs: string[];
    sessions: string[];
    users: string[];
    isActive: boolean;
    branches: string[];
    _id: string;
    title: string;
    category: string;
    createdBy: TUser;
    organization: string;
    createdAt: string;
    thumbnail?: string;
}
