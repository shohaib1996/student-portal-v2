'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import TopTags from './TopTags';
import TopContributors from './TopContributors';

const CommunitySidebar = ({
    isOpen,
    setIsOpen,
    tags,
    setTags,
    setUser,
}: any) => {
    const sidebarRef = useRef<HTMLDivElement>(null);

    // ✅ Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false); // Close sidebar if clicked outside
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <>
            {/* Sliding Sidebar (Visible on Small Screens) */}
            {isOpen && (
                <div className='fixed inset-0 z-40 md:hidden'>
                    <motion.div
                        ref={sidebarRef} // ✅ Attach ref to sidebar
                        initial={{ x: '100%' }}
                        animate={{ x: isOpen ? '0%' : '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className='fixed right-0 top-0 z-50 h-full w-[75%] max-w-sm overflow-y-auto bg-background p-4 shadow-lg md:hidden'
                    >
                        {/* Close Button */}
                        <Button
                            className='absolute right-3 top-3'
                            onClick={() => setIsOpen(false)}
                        >
                            <X size={24} />
                        </Button>

                        <TopTags tags={tags} setTags={setTags} />
                        <TopContributors setUser={setUser} />
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default CommunitySidebar;
