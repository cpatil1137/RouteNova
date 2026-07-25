'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

export default function CameraRig() {
    const { camera } = useThree();
    const scroll = useScroll();

    // Camera animation state
    const animationPhase = useRef(0);
    const autoRotate = useRef(true);
    const lastScrollTime = useRef(0);

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();
        const scrollOffset = scroll?.offset || 0;

        // Detect user scroll
        if (scrollOffset > 0) {
            lastScrollTime.current = time;
            autoRotate.current = false;
        } else if (time - lastScrollTime.current > 3) {
            // Resume auto-rotate after 3 seconds of no scroll
            autoRotate.current = true;
        }

        // Cinematic flyover sequence
        if (autoRotate.current) {
            // Phase 0-1: Wide view of Pune (0-10s)
            // Phase 1-2: Zoom to Koregaon Park (10-20s)
            // Phase 2-3: Orbit around pins (20-30s)
            const cycleDuration = 30;
            const cycleTime = (time % cycleDuration) / cycleDuration;
            animationPhase.current = cycleTime;

            if (cycleTime < 0.33) {
                // Wide view - high and far
                const t = cycleTime / 0.33;
                const angle = t * Math.PI * 2;
                const radius = 40;
                const height = 30;

                camera.position.x = Math.cos(angle) * radius;
                camera.position.z = Math.sin(angle) * radius;
                camera.position.y = height;
                camera.lookAt(0, 0, 0);
            } else if (cycleTime < 0.66) {
                // Zoom to Koregaon Park
                const t = (cycleTime - 0.33) / 0.33;
                const startRadius = 40;
                const endRadius = 15;
                const startHeight = 30;
                const endHeight = 12;

                const radius = THREE.MathUtils.lerp(startRadius, endRadius, t);
                const height = THREE.MathUtils.lerp(startHeight, endHeight, t);
                const angle = (t + 0.33) * Math.PI * 2;

                camera.position.x = Math.cos(angle) * radius;
                camera.position.z = Math.sin(angle) * radius;
                camera.position.y = height;

                // Focus on Koregaon area (positive X)
                camera.lookAt(5, 0, 0);
            } else {
                // Close orbit around pins
                const t = (cycleTime - 0.66) / 0.34;
                const angle = t * Math.PI * 2;
                const radius = 12;
                const height = 8;

                camera.position.x = Math.cos(angle) * radius;
                camera.position.z = Math.sin(angle) * radius;
                camera.position.y = height + Math.sin(angle * 3) * 2; // Wavy motion

                camera.lookAt(0, 2, 0); // Look at pin level
            }
        } else {
            // Scroll-controlled camera
            const scrollPhase = scrollOffset * 3; // Amplify scroll effect

            if (scrollPhase < 1) {
                // Tilt down as user scrolls
                const angle = scrollPhase * Math.PI * 0.3;
                camera.position.y = 30 - scrollPhase * 15;
                camera.rotation.x = -angle;
            } else if (scrollPhase < 2) {
                // Zoom in
                const t = scrollPhase - 1;
                const radius = THREE.MathUtils.lerp(40, 15, t);
                camera.position.x = Math.cos(t * Math.PI) * radius;
                camera.position.z = Math.sin(t * Math.PI) * radius;
                camera.position.y = 15;
                camera.lookAt(0, 0, 0);
            } else {
                // Orbit around
                const t = scrollPhase - 2;
                const angle = t * Math.PI * 2;
                camera.position.x = Math.cos(angle) * 12;
                camera.position.z = Math.sin(angle) * 12;
                camera.position.y = 10;
                camera.lookAt(0, 2, 0);
            }
        }

        // Smooth camera movement
        camera.updateProjectionMatrix();
    });

    return null;
}
