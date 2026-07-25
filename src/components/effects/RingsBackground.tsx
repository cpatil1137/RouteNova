'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export default function RingsBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const animationFrameRef = useRef<number>(0);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Settings
        const settings = {
            rotation: 0.37,
            zoom: 36,
            size: 4,
            speed: 0.05
        };

        // Initialize scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            alpha: true
        });

        renderer.setClearColor(0x000000, 1);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        rendererRef.current = renderer;

        // Create rings
        const group = new THREE.Group();
        const rings: THREE.Mesh[] = [];
        const ringCount = 40;
        const baseRadius = 1;
        const radiusStep = 0.5;
        const initialColor = new THREE.Color("#404040");

        for (let i = 0; i < ringCount; i++) {
            const geometry = new THREE.RingGeometry(
                baseRadius + i * radiusStep,
                baseRadius + i * radiusStep + 0.1,
                64
            );
            const material = new THREE.MeshBasicMaterial({
                color: initialColor,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(geometry, material);
            rings.push(ring);
            group.add(ring);
        }
        scene.add(group);

        // Create particles
        const particleCount = 5000;
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 100;
        }

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.05,
            color: 0xffffff,
            transparent: true,
            opacity: 0.6
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // Setup camera and rotation
        camera.position.set(0, 0, settings.zoom);
        camera.up.set(0, 1, 0);
        camera.lookAt(0, 0, 0);
        group.rotation.x = -Math.PI * settings.rotation;

        // Animate rings with GSAP
        rings.forEach((ring, index) => {
            gsap.to(ring.position, {
                y: -settings.size,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                delay: (rings.length - index) * settings.speed
            });

            gsap.to(ring.material.color, {
                r: 0.37,
                g: 0.64,
                b: 0.98,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                delay: (rings.length - index) * settings.speed
            });
        });

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };

        window.addEventListener('resize', handleResize);

        // Animation loop
        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);

            // Rotate particles slowly
            if (particles) {
                particles.rotation.y += 0.0002;
            }

            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            // Kill all GSAP animations
            gsap.killTweensOf(rings.map(r => r.position));
            gsap.killTweensOf(rings.map(r => r.material.color));

            if (renderer) {
                renderer.dispose();
            }

            rings.forEach(ring => {
                ring.geometry.dispose();
                (ring.material as THREE.Material).dispose();
            });

            particleGeometry.dispose();
            particleMaterial.dispose();
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
