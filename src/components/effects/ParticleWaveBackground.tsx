"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Quality levels for adaptive performance
const QUALITY_LEVELS = {
    HIGH: { resolution: 50, label: 'High' },      // 2,500 vertices (90% reduction from original)
    MEDIUM: { resolution: 30, label: 'Medium' },  // 900 vertices
    LOW: { resolution: 20, label: 'Low' }         // 400 vertices
};

export default function ParticleWaveBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [quality, setQuality] = useState(QUALITY_LEVELS.HIGH);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        let isPageVisible = true;
        let frameCount = 0;
        let lastFpsCheck = performance.now();
        let currentFps = 60;

        // Constants
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        // Scene
        const scene = new THREE.Scene()

        // Camera
        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
        camera.position.z = 10
        camera.position.y = 1.1
        camera.position.x = 0
        scene.add(camera)

        // Plane with adaptive quality
        const planeGeometry = new THREE.PlaneGeometry(20, 20, quality.resolution, quality.resolution)
        const planeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uElevation: { value: 0.482 }
            },
            vertexShader: `
            uniform float uTime;
            uniform float uElevation;

            attribute float aSize;

            varying float vPositionY;
            varying float vPositionZ;

            void main() {
                vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                modelPosition.y = sin(modelPosition.x - uTime) * sin(modelPosition.z * 0.6 + uTime) * uElevation;

                vec4 viewPosition = viewMatrix * modelPosition;
                gl_Position = projectionMatrix * viewPosition;

                gl_PointSize = 2.0 * aSize;
                gl_PointSize *= ( 1.0 / - viewPosition.z );

                vPositionY = modelPosition.y;
                vPositionZ = modelPosition.z;
            }
        `,
            fragmentShader: `
            uniform float uTime;
            varying float vPositionY;
            varying float vPositionZ;

            void main() {
                float strength = (vPositionY + 0.25) * 0.3;
                
                // Define theme colors
                vec3 cyan = vec3(0.369, 0.918, 0.831);    // #5EEAD4
                vec3 violet = vec3(0.545, 0.361, 0.965);  // #8B5CF6
                vec3 pink = vec3(0.925, 0.282, 0.6);      // #EC4899

                // Optimized color mixing
                float timeFactor = uTime * 1.57;
                float mixFactor = sin(vPositionY * 2.0 + timeFactor) * 0.5 + 0.5;
                
                vec3 mixedColor = mix(mix(cyan, violet, mixFactor), pink, sin(timeFactor * 0.5) * 0.5 + 0.5);

                gl_FragColor = vec4(mixedColor, strength);
            }
        `,
            transparent: true,
        })

        const planeSizesArray = new Float32Array(planeGeometry.attributes.position.count)
        for (let i = 0; i < planeSizesArray.length; i++) {
            planeSizesArray[i] = Math.random() * 4.0
        }
        planeGeometry.setAttribute('aSize', new THREE.BufferAttribute(planeSizesArray, 1))

        const plane = new THREE.Points(planeGeometry, planeMaterial)
        plane.rotation.x = - Math.PI * 0.4
        scene.add(plane)

        // Renderer with optimized settings
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: false, // Disable antialiasing for better performance
            powerPreference: "high-performance"
        })
        renderer.setSize(sizes.width, sizes.height)
        // Cap pixel ratio at 1.5 instead of 2 for better performance
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

        // Page Visibility API - pause animation when page is hidden
        const handleVisibilityChange = () => {
            isPageVisible = !document.hidden;
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)

        // Resize
        const handleResize = () => {
            sizes.width = window.innerWidth
            sizes.height = window.innerHeight

            camera.aspect = sizes.width / sizes.height
            camera.updateProjectionMatrix()

            renderer.setSize(sizes.width, sizes.height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
        }

        window.addEventListener('resize', handleResize)

        // FPS monitoring for adaptive quality
        const checkPerformance = () => {
            const now = performance.now();
            const delta = now - lastFpsCheck;

            if (delta >= 1000) { // Check every second
                currentFps = (frameCount * 1000) / delta;
                frameCount = 0;
                lastFpsCheck = now;

                // Adaptive quality adjustment
                if (currentFps < 25 && quality.resolution > QUALITY_LEVELS.LOW.resolution) {
                    console.log('Performance: Reducing quality due to low FPS:', currentFps);
                    setQuality(prev =>
                        prev.resolution === QUALITY_LEVELS.HIGH.resolution ? QUALITY_LEVELS.MEDIUM :
                            QUALITY_LEVELS.LOW
                    );
                } else if (currentFps > 50 && quality.resolution < QUALITY_LEVELS.HIGH.resolution) {
                    console.log('Performance: Increasing quality due to high FPS:', currentFps);
                    setQuality(prev =>
                        prev.resolution === QUALITY_LEVELS.LOW.resolution ? QUALITY_LEVELS.MEDIUM :
                            QUALITY_LEVELS.HIGH
                    );
                }
            }
        }

        // Animate
        const clock = new THREE.Clock()
        let animationId: number;

        const animate = () => {
            // Only animate if page is visible
            if (isPageVisible) {
                const elapsedTime = clock.getElapsedTime()
                planeMaterial.uniforms.uTime.value = elapsedTime * 0.8 // Slightly slower for smoother feel

                renderer.render(scene, camera)

                frameCount++;
                checkPerformance();
            }

            animationId = window.requestAnimationFrame(animate)
        }

        animate()

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.cancelAnimationFrame(animationId)
            renderer.dispose()
            planeGeometry.dispose()
            planeMaterial.dispose()
        }
    }, [quality]) // Re-create geometry when quality changes

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 outline-none z-0 w-full h-full pointer-events-none"
        />
    )
}
