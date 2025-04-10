import { useEffect, useRef, useState } from 'react';

type CSSPropertiesWithVars = React.CSSProperties & {
    [key: string]: string | number | undefined;
};

function useAspectRatioFitting(
    width: number,
    height: number,
): [React.RefObject<HTMLDivElement | null>, CSSPropertiesWithVars] {
    const containerRef = useRef<HTMLDivElement>(null);
    const [styles, setStyles] = useState<CSSPropertiesWithVars>({});

    useEffect(() => {
        const updateStyles = () => {
            if (!containerRef.current) {
                return;
            }

            const container = containerRef.current.getBoundingClientRect();

            const containerAspectRatio = container.width / container.height;
            const targetAspectRatio = width / height;

            let computedStyles: CSSPropertiesWithVars = {
                width: '100%',
                height: '100%',
                position: 'relative',
            };

            if (containerAspectRatio > targetAspectRatio) {
                // Container is wider than target aspect ratio
                const scaledWidth =
                    (targetAspectRatio / containerAspectRatio) * 100;
                computedStyles = {
                    ...computedStyles,
                    width: `${scaledWidth}%`,
                    height: '100%',
                    marginLeft: `${(100 - scaledWidth) / 2}%`,
                };
            } else {
                // Container is taller than target aspect ratio
                const scaledHeight =
                    (containerAspectRatio / targetAspectRatio) * 100;
                computedStyles = {
                    ...computedStyles,
                    width: '100%',
                    height: `${scaledHeight}%`,
                    marginTop: `${(100 - scaledHeight) / 2}%`,
                };
            }

            setStyles(computedStyles);
        };

        // Initial calculation
        updateStyles();

        // Add resize listener
        window.addEventListener('resize', updateStyles);
        return () => {
            window.removeEventListener('resize', updateStyles);
        };
    }, [width, height]);

    return [containerRef, styles];
}

export default useAspectRatioFitting;
