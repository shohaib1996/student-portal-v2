interface GlobalHeaderProps {
    title: string;
    subtitle: string;
    children?: React.ReactNode;
}

export function GlobalHeader({ title, subtitle, children }: GlobalHeaderProps) {
    return (
        <div className='flex items-center justify-between border-b border-border py-3'>
            <div className='flex flex-col gap-1'>
                <h1 className='text-xl font-semibold'>{title}</h1>
                <p className='text-sm text-muted-foreground'>{subtitle}</p>
            </div>
            <div>{children}</div>
        </div>
    );
}
