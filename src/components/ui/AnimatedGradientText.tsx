'use client';

import { useEffect, useState } from 'react';

interface AnimatedGradientTextProps {
    text: string;
    className?: string;
    gradientPercentage?: number; // Percentage of characters to apply gradient (0-100)
}

export default function AnimatedGradientText({
    text,
    className = '',
    gradientPercentage = 40
}: AnimatedGradientTextProps) {
    const [gradientIndices, setGradientIndices] = useState<Set<number>>(new Set());

    useEffect(() => {
        // Randomly select characters to apply gradient
        const indices = new Set<number>();
        const totalChars = text.replace(/\s/g, '').length; // Count non-space characters
        const numGradientChars = Math.floor(totalChars * (gradientPercentage / 100));

        let charIndex = 0;
        const charPositions: number[] = [];

        // Get positions of all non-space characters
        for (let i = 0; i < text.length; i++) {
            if (text[i] !== ' ') {
                charPositions.push(i);
            }
        }

        // Randomly select positions
        const shuffled = [...charPositions].sort(() => Math.random() - 0.5);
        for (let i = 0; i < numGradientChars && i < shuffled.length; i++) {
            indices.add(shuffled[i]);
        }

        setGradientIndices(indices);
    }, [text, gradientPercentage]);

    return (
        <h1 className={className}>
            {text.split('').map((char, index) => {
                if (char === ' ') {
                    return <span key={index}> </span>;
                }

                if (gradientIndices.has(index)) {
                    return (
                        <span
                            key={index}
                            className="inline-block animated-gradient-text"
                        >
                            {char}
                        </span>
                    );
                }

                return <span key={index}>{char}</span>;
            })}
        </h1>
    );
}
