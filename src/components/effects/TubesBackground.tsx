'use client';

import { useEffect, useRef } from 'react';

export default function TubesBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Load the tubes cursor library from CDN
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
            import TubesCursor from "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js"

            const canvas = document.getElementById("tubes-canvas")

            const app = TubesCursor(canvas, {
                tubes: {
                    colors: ["#ec4899"], // pink-500
                    lights: {
                        intensity: 220,
                        colors: ["#ec4899"]
                    }
                }
            })

            // ---- ARC SETTINGS ----
            const radius = 420
            const cx = window.innerWidth / 2
            const cy = window.innerHeight * 0.55   // center below arc
            const speed = 0.008

            let t = Math.PI   // start from left

            function animate() {
                // TOP semicircle (important change)
                const x = cx + radius * Math.cos(t)
                const y = cy - radius * Math.sin(t)

                app.cursor?.set(x, y)

                t -= speed

                // reset after one arc (NO infinity)
                if (t <= 0) {
                    t = Math.PI
                }

                requestAnimationFrame(animate)
            }

            animate()
        `;

        document.body.appendChild(script);

        // Cleanup
        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    return (
        <canvas
            id="tubes-canvas"
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
}
