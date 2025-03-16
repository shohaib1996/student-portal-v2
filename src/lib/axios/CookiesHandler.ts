'use server';

import { cookies } from 'next/headers';

const CookiesHandler = async (
    method: 'get' | 'remove' | 'add',
    name: string,
    value?: string,
    options?: Record<string, string> | undefined,
): Promise<any> => {
    const cookieStore = await cookies();

    if (!name) {
        return '';
    }

    switch (method) {
        case 'add':
            if (value) {
                cookieStore.set(name, value, options);
            }
            break;

        case 'get':
            return cookieStore.get(name);

        case 'remove':
            cookieStore.delete(name);
            break;

        default:
            return cookieStore.get(name);
    }

    return null;
};

export default CookiesHandler;
