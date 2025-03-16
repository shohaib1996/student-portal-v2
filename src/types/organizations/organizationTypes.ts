export interface IOrganizationData {
    email: string;
    postalAddress: string;
    companyUrl: string;
    phone: string;
    faxNumber: string;
    taxNumber: string;
    contactPerson: string;
    companyLogo: string;
    companyDocument: string;
    otherDocument: string;
    about: string;
    facebook: string;
    twitter: string;
    youtube: string;
}

export interface IOrganization {
    data: IOrganizationData;
    _id: string;
    name: string;
    slug: string;
}

export interface IApiResponse {
    success: boolean;
    organizations: IOrganization[];
}
