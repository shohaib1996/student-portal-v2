export interface ITransaction {
    amount?: number;
    status?: string;
    note?: string;
    _id?: string;
    method?: string;
    attachment?: string;
    date?: string; // Consider using `Date` if you'll be working with date objects
    enrollment?: string;
    user?: string;
    branch?: string;
    session?: string;
    program?: string;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}
