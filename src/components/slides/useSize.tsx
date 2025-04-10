import { useState, useEffect, useRef, RefObject } from 'react';

interface Size {
    width: number;
    height: number;
}

/**
 * Custom hook to measure the size of a DOM element
 * This is a modern alternative to react-sizeme which has compatibility issues with React 18
 *
 * @returns [ref, size] - A tuple containing the ref to attach to an element and the current size
 */
function useSize<T extends HTMLElement = HTMLDivElement>(): [
    RefObject<T | null>,
    Size,
] {
    const ref = useRef<T>(null);
    const [size, setSize] = useState<Size>({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        const updateSize = () => {
            if (ref.current) {
                const { width, height } = ref.current.getBoundingClientRect();
                setSize({ width, height });
            }
        };

        // Update size initially
        updateSize();

        // Set up ResizeObserver to monitor changes
        const resizeObserver = new ResizeObserver((entries) => {
            if (!Array.isArray(entries) || !entries.length) {
                return;
            }
            updateSize();
        });

        resizeObserver.observe(ref.current);

        // Clean up observer on unmount
        return () => {
            if (ref.current) {
                resizeObserver.unobserve(ref.current);
            }
            resizeObserver.disconnect();
        };
    }, []);

    return [ref, size];
}

export default useSize;
