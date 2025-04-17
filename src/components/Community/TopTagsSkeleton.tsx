const TopTagsSkeleton = () => {
    return (
        <div className='rounded-xl bg-background p-common-multiplied'>
            <h1 className='text-[26px] font-semibold text-gray'>Top Tags</h1>
            <div>
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className='mt-common rounded-xl border-2 border-border bg-foreground p-common'
                    >
                        <div className='h-5 w-24 rounded bg-gray'></div>{' '}
                        {/* Tag Name Placeholder */}
                        <div className='mt-2 h-4 w-16 rounded bg-gray'></div>{' '}
                        {/* Count Placeholder */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopTagsSkeleton;
