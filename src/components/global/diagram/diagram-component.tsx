'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import '@excalidraw/excalidraw/index.css';

// Dynamic import for client-side only rendering
const Excalidraw = dynamic(
    async () => (await import('@excalidraw/excalidraw')).Excalidraw,
    {
        ssr: false,
    },
);

interface DiagramComponentProps {
    diagram: string[];
    height?: string;
    zoom?: number;
    viewMode?: boolean;
}

export default function DiagramComponent({
    diagram,
    height = '600px',
    zoom = 1,
    viewMode = true,
}: DiagramComponentProps) {
    let parsedDiagram = null;

    if (diagram) {
        try {
            parsedDiagram = JSON.parse(diagram.join(''));

            if (!Array.isArray(parsedDiagram?.appState?.collaborators)) {
                parsedDiagram.appState.collaborators = [];
            }
        } catch (error) {
            console.error('Invalid JSON string for diagram:', error);
        }
    }

    const [appState, setAppState] = useState(() => ({
        ...(parsedDiagram?.appState || {
            viewBackgroundColor: 'white',
            scrollX: 0,
            scrollY: 0,
            gridSize: null,
            collaborators: [],
        }),
        zoom: zoom || parsedDiagram?.appState?.zoom || 1,
    }));

    useEffect(() => {
        if (zoom) {
            setAppState((prev: typeof appState) => ({
                ...prev,
                zoom,
            }));
        }
    }, [zoom]);

    if (!diagram) {
        return null;
    }

    return (
        <div className='w-full'>
            <div
                style={{
                    height,
                    width: '100%',
                    borderRadius: '10px',
                }}
            >
                <Excalidraw
                    initialData={{
                        elements: parsedDiagram?.diagram || [],
                        appState: {
                            ...appState,
                            viewBackgroundColor: 'white',
                            gridSize: null,
                        },
                    }}
                    viewModeEnabled={viewMode}
                    zenModeEnabled={true}
                />
            </div>
        </div>
    );
}
