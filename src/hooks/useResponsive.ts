import { useState, useEffect } from 'react';

/**
 * A custom React hook that checks if a media query matches the current viewport.
 *
 * @param {string} query - The media query to check (e.g. 'max-width: 760px')
 * @returns {boolean} - Returns true if the media query matches, false otherwise
 *
 * @example
 * // Check if viewport width is less than 760px
 * const isMobile = useResponsive('max-width: 760px');
 *
 * // Check if viewport is in landscape orientation
 * const isLandscape = useResponsive('orientation: landscape');
 */
const useResponsive = (query: string): boolean => {
    // Ensure the query string is properly formatted with parentheses
    const mediaQuery = query.includes('(') ? query : `(${query})`;

    // Initialize state with the current match state
    // We use null as initial state and set the actual value in useEffect to avoid SSR issues
    const [matches, setMatches] = useState<boolean>(false);

    useEffect(() => {
        // Check if window is defined (for SSR compatibility)
        if (typeof window === 'undefined') {
            return;
        }

        // Create a media query list
        const mediaQueryList = window.matchMedia(mediaQuery);

        // Set the initial value
        setMatches(mediaQueryList.matches);

        // Define the change handler
        const handleChange = (event: MediaQueryListEvent): void => {
            setMatches(event.matches);
        };

        // Add the event listener
        mediaQueryList.addEventListener('change', handleChange);

        // Clean up the event listener on component unmount
        return () => {
            mediaQueryList.removeEventListener('change', handleChange);
        };
    }, [mediaQuery]); // Re-run effect if the query changes

    return matches;
};

export default useResponsive;
