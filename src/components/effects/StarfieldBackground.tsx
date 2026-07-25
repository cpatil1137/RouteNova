'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function StarfieldBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>(0);

    useEffect(() => {
        if (!canvasRef.current) return;

        const PARTICLE_SIZE = 500;
        const SPREAD_RADIUS = 450;

        // Initialize scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 100;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create particles with alternating colors
        const positions: number[] = [];
        const velocity: number[] = [];
        const acceleration: number[] = [];
        const colors: number[] = [];

        const tealColor = new THREE.Color(0x5EEAD4);
        const whiteColor = new THREE.Color(0xFFFFFF);

        for (let i = 0; i < PARTICLE_SIZE; i++) {
            const x = THREE.MathUtils.randFloatSpread(SPREAD_RADIUS);
            const y = THREE.MathUtils.randFloatSpread(SPREAD_RADIUS);
            const z = THREE.MathUtils.randFloatSpread(SPREAD_RADIUS);

            // Each particle is a line segment (2 points)
            positions.push(x, y, z, x, y, z);

            // Alternate between teal and white
            const color = i % 2 === 0 ? tealColor : whiteColor;
            colors.push(color.r, color.g, color.b, color.r, color.g, color.b);

            velocity.push(0);
            acceleration.push(0.02); // Slower initial acceleration
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geo.setAttribute('velocity', new THREE.Float32BufferAttribute(velocity, 1));
        geo.setAttribute('acceleration', new THREE.Float32BufferAttribute(acceleration, 1));

        const mat = new THREE.LineBasicMaterial({
            vertexColors: true
        });

        const stars = new THREE.LineSegments(geo, mat);
        const group = new THREE.Group();
        group.add(stars);
        scene.add(group);

        // Speed control variables
        let speedMultiplier = 0.2; // Start very slow
        let speedDirection = 1; // 1 for increasing, -1 for decreasing
        const minSpeed = 0.2; // Slow
        const maxSpeed = 0.8; // Normal (not fast)
        const speedChangeRate = 0.001; // Slower transition

        // Animation loop
        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);

            // Gradually change speed
            speedMultiplier += speedChangeRate * speedDirection;
            if (speedMultiplier >= maxSpeed) {
                speedDirection = -1; // Start slowing down
            } else if (speedMultiplier <= minSpeed) {
                speedDirection = 1; // Start speeding up
            }

            const posArray = stars.geometry.attributes.position.array as Float32Array;
            const velArray = stars.geometry.attributes.velocity.array as Float32Array;
            const accArray = stars.geometry.attributes.acceleration.array as Float32Array;
            const colorArray = stars.geometry.attributes.color.array as Float32Array;

            let index = 0;
            for (let i = 0; i < PARTICLE_SIZE; i++) {
                let v = velArray[i];
                const a = accArray[i] * speedMultiplier;

                v += a;
                v = THREE.MathUtils.clamp(v, 0, 3.5 * speedMultiplier);

                let x = posArray[index];
                let y = posArray[index + 1];
                let z = posArray[index + 2];
                let xx = posArray[index + 3];
                let yy = posArray[index + 4];
                let zz = posArray[index + 5];

                // Reset particle if it goes too far
                if (z > 100) {
                    x = xx = THREE.MathUtils.randFloatSpread(SPREAD_RADIUS);
                    y = yy = THREE.MathUtils.randFloatSpread(SPREAD_RADIUS);
                    z = zz = -100;

                    posArray[index] = x;
                    posArray[index + 1] = y;
                    posArray[index + 3] = xx;
                    posArray[index + 4] = yy;

                    // Reassign color on reset
                    const color = i % 2 === 0 ? tealColor : whiteColor;
                    const colorIndex = i * 6;
                    colorArray[colorIndex] = color.r;
                    colorArray[colorIndex + 1] = color.g;
                    colorArray[colorIndex + 2] = color.b;
                    colorArray[colorIndex + 3] = color.r;
                    colorArray[colorIndex + 4] = color.g;
                    colorArray[colorIndex + 5] = color.b;
                }

                // Move particle forward
                z += v;
                zz += v * 1.5;

                velArray[i] = v;
                posArray[index + 2] = z;
                posArray[index + 5] = zz;

                index += 6;
            }

            stars.geometry.attributes.position.needsUpdate = true;
            stars.geometry.attributes.velocity.needsUpdate = true;
            stars.geometry.attributes.color.needsUpdate = true;

            renderer.render(scene, camera);
        };
        animate();

        // Resize handler
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            renderer.dispose();
            geo.dispose();
            mat.dispose();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full"
            style={{ zIndex: 0 }}
        />
    );
}
