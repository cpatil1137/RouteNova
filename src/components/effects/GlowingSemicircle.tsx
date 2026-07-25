'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GlowingSemicircle() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(600, 600);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        containerRef.current.appendChild(renderer.domElement);

        // Create semicircle geometry
        const radius = 2;
        const segments = 128;
        const curve = new THREE.EllipseCurve(
            0, 0,           // center
            radius, radius, // x radius, y radius
            0, Math.PI,     // start angle, end angle (semicircle)
            false,          // clockwise
            0               // rotation
        );

        const points = curve.getPoints(segments);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Create glowing material with gradient
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color(0xec4899) }, // pink-500
                color2: { value: new THREE.Color(0xa855f7) }, // violet-500
                glowIntensity: { value: 1.5 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = 8.0;
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                uniform float glowIntensity;
                varying vec3 vPosition;
                
                void main() {
                    // Gradient between pink and violet
                    float mixFactor = (sin(vPosition.x + time) + 1.0) * 0.5;
                    vec3 color = mix(color1, color2, mixFactor);
                    
                    // Pulsing glow effect
                    float glow = (sin(time * 2.0) + 1.0) * 0.5 * glowIntensity;
                    color *= (1.0 + glow);
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        // Create the semicircle line
        const semicircle = new THREE.Line(geometry, material);
        semicircle.position.y = -0.5;
        scene.add(semicircle);

        // Add outer glow using points
        const glowMaterial = new THREE.PointsMaterial({
            color: 0xec4899,
            size: 0.15,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        const glowPoints = new THREE.Points(geometry, glowMaterial);
        glowPoints.position.y = -0.5;
        scene.add(glowPoints);

        // Create floating particles
        const particleCount = 20;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleVelocities: number[] = [];

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI;
            const r = radius * (0.8 + Math.random() * 0.4);
            particlePositions[i * 3] = Math.cos(angle) * r;
            particlePositions[i * 3 + 1] = Math.sin(angle) * r - 0.5;
            particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
            particleVelocities.push(Math.random() * 0.002 + 0.001);
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0xec4899,
            size: 0.08,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // Animation
        let animationId: number;
        const clock = new THREE.Clock();

        const animate = () => {
            const elapsedTime = clock.getElapsedTime();

            // Update shader time uniform
            material.uniforms.time.value = elapsedTime;

            // Rotate semicircle slowly
            semicircle.rotation.z = Math.sin(elapsedTime * 0.3) * 0.1;
            glowPoints.rotation.z = Math.sin(elapsedTime * 0.3) * 0.1;

            // Animate particles
            const positions = particleGeometry.attributes.position.array as Float32Array;
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3 + 1] += particleVelocities[i];

                // Reset particle if it goes too high
                if (positions[i * 3 + 1] > 2) {
                    const angle = Math.random() * Math.PI;
                    const r = radius * (0.8 + Math.random() * 0.4);
                    positions[i * 3] = Math.cos(angle) * r;
                    positions[i * 3 + 1] = -2;
                }
            }
            particleGeometry.attributes.position.needsUpdate = true;

            // Pulse particle opacity
            particleMaterial.opacity = 0.5 + Math.sin(elapsedTime * 2) * 0.3;

            renderer.render(scene, camera);
            animationId = requestAnimationFrame(animate);
        };

        animate();

        // Handle resize
        const handleResize = () => {
            if (!containerRef.current) return;
            const size = Math.min(containerRef.current.clientWidth, 600);
            renderer.setSize(size, size);
            camera.aspect = 1;
            camera.updateProjectionMatrix();
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
            glowMaterial.dispose();
            particleGeometry.dispose();
            particleMaterial.dispose();
            if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ width: '600px', height: '600px', margin: 'auto' }}
        />
    );
}
