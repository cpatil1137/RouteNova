'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function CameraRig() {
    const { camera } = useThree();
    const [phase, setPhase] = useState(0);
    const timeRef = useRef(0);

    useEffect(() => {
        // Initial camera position
        camera.position.set(0, 50, 150);
        camera.lookAt(0, 0, 0);
    }, [camera]);

    useFrame((state, delta) => {
        timeRef.current += delta;
        const time = timeRef.current;

        // Cinematic camera animation sequence
        if (time < 3) {
            // Phase 1: Wide shot, slow zoom in
            const progress = time / 3;
            camera.position.z = THREE.MathUtils.lerp(150, 120, progress);
            camera.position.y = THREE.MathUtils.lerp(50, 40, progress);
        } else if (time < 6) {
            // Phase 2: Orbit around city
            const progress = (time - 3) / 3;
            const angle = progress * Math.PI * 0.5;
            const radius = 120;
            camera.position.x = Math.sin(angle) * radius;
            camera.position.z = Math.cos(angle) * radius;
            camera.position.y = 40 + Math.sin(progress * Math.PI) * 10;
        } else {
            // Phase 3: Gentle orbit
            const angle = time * 0.05;
            const radius = 100;
            camera.position.x = Math.sin(angle) * radius;
            camera.position.z = Math.cos(angle) * radius;
            camera.position.y = 35 + Math.sin(time * 0.3) * 5;
        }

        // Always look at center
        camera.lookAt(0, 10, 0);

        // Scroll interaction (if needed)
        if (typeof window !== 'undefined') {
            const scrollY = window.scrollY;
            const maxScroll = 500;
            const scrollProgress = Math.min(scrollY / maxScroll, 1);

            // Zoom in on scroll
            if (scrollProgress > 0) {
                camera.position.multiplyScalar(1 - scrollProgress * 0.3);
            }
        }
    });

    return null;
}
