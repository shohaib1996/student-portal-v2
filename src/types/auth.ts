export type TSingleRow = {
    description?: string;
    icon?: string;
    id?: string;
    label?: string;
    type?: string;
    isDefault?: boolean;
    isRequired?: boolean;
    children?: string[];
    options?: { value: string }[];
    value?: string;
};

export type StepRow = {
    icon?: string;
    id?: string;
    label?: string;
    type?: string;
    _id: string;
    fields?: TSingleRow[];
};

export type TFormStepData = {
    icon?: string;
    id?: string;
    label?: string;
    type?: string;
    _id: string;
    rows: StepRow[];
};

export type TEnrollment = {
    activeTill?: null | string;
    branch?: string;
    createdAt?: string;
    updatedAt?: string;
    id?: string;
    organization?: string;
    program?: {
        title?: string;
        _id?: string;
    };
    session: {
        name?: string;
        _id?: string;
    };
    status?: string;
    formStepsData?: TFormStepData[];
    _id: string;
};

export type TUser = {
    _id: string;
    updatedAt?: string;
    id?: string;
    middleInitial?: string;
    education?: string;
    profilePicture?: string;
    fullName?: string;
    lastPasswordChange?: string;
    email?: string;
    gender?: string;
    firstName?: string;
    createdAt?: string;
    lastName?: string;
    enrollment: TEnrollment;
    lastActive?: string;
    isEmailVerified?: {
        status: boolean;
        token?: string;
    };
    personalData?: {
        address?: {
            city?: string;
            country?: string;
            postalCode?: string;
            state?: string;
            street?: string;
        };
        resume?: string;
        socialMedia?: {
            facebook?: string;
            linkedin?: string;
            instagram?: string;
            twitter?: string;
            github?: string;
        };
    };
    phone?:
        | {
              countryCode?: string;
              number?: string;
              isVerified?: boolean;
          }
        | string;
    about?: string;
    website?: string;
    dateOfBirth?: Date | string;
    isActive?: boolean;
};

export type TStaff = {
    inOwner?: boolean;
    user: TUser;
    roles?: string[];
    branchRoles: { name?: string; _id: string }[];
    _id?: string;
    updatedAt: string;
    createdAt: string;
    organization?: string;
    isActive?: boolean;
};
