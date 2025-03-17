// Main type
export interface TProgramMain {
    success: boolean;
    program: TProgram;
    session: TSession;
    status: string;
    enrollment: TEnrollment;
}

// Program type
export interface TProgram {
    price: TPrice;
    meta: TMeta;
    alumni: TAlumni;
    obtainCertification: TObtainCertification;
    image: string;
    label: string;
    language: string;
    tags: any[];
    shortDetail: string;
    requirements: string;
    description: string;
    shortDescription: string;
    isDemo: boolean;
    content: any;
    type: string;
    isPublished: boolean;
    isFeatured: boolean;
    country: string;
    branches: string[];
    _id: string;
    title: string;
    slug: string;
    category: string;
    subCategory: any;
    instructor: TInstructor;
    whatLearns: TWhatLearn[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    benefits: TBenefit[];
    organization: string;
    progress: TProgress[];
    faqs: TFaq[];
    layoutSections: TLayoutSection[];
    instructors: any[];
}

// Price type
export interface TPrice {
    cost: TCost;
    isFree: boolean;
}

export interface TCost {
    price: number;
    salePrice: number;
}

// Meta type
export interface TMeta {
    title: string;
    description: string;
}

// Alumni type
export interface TAlumni {
    images: string[];
    title: string;
}

// Obtain Certification type
export interface TObtainCertification {
    title: string;
    description: string;
}

// Instructor type
export interface TInstructor {
    about: string;
    image: string;
    isActive: boolean;
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    organization: string;
}

// WhatLearn type
export interface TWhatLearn {
    _id: string;
    key: number;
    title: string;
}

// Benefit type
export interface TBenefit {
    _id: string;
    title: string;
    description: string;
    icon: string;
}

// Progress type
export interface TProgress {
    _id: string;
    id: string;
    title: string;
    limit: number;
}

// FAQ type
export interface TFaq {
    _id: string;
    question: string;
    answer: string;
}

// Layout Section type
export interface TLayoutSection {
    isVisible: boolean;
    _id: string;
    id: string;
    title: string;
}

// Session type
export interface TSession {
    isActive: boolean;
    _id: string;
    name: string;
    startingDate: any;
    organization: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

// Enrollment type
export interface TEnrollment {
    status: string;
    _id: string;
    totalAmount: number;
    user: string;
    organization: string;
    branch: string;
    program: TProgram;
    session: TSession;
    formStepsData: TFormStep[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    activeTill: any;
    id: string;
}

// Form Step type
export interface TFormStep {
    _id: string;
    label: string;
    icon: string;
    type: string;
    id: string;
    rows: TFormRow[];
}

// Form Row type
export interface TFormRow {
    _id: string;
    label: string;
    icon: string;
    type: string;
    id: string;
    fields: TFormField[];
}

// Form Field type
export interface TFormField {
    options: TOption[];
    children: string[];
    _id: string;
    id: string;
    icon: string;
    label: string;
    isDefault: boolean;
    isRequired: boolean;
    type: string;
    description: string;
    value?: any;
}

// Option type
export interface TOption {
    value: string;
}
