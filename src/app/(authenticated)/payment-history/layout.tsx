import { ReactNode, Suspense } from 'react';

export default async function AuthLayout({
    children,
}: {
    children: ReactNode;
}) {
    return <>{children}</>;
}
