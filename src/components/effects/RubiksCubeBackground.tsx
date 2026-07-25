'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three-stdlib';


export default function RubiksCubeBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // --- Helpers ---
        function Sizes() {
            return {
                width,
                height,
                aspect: width / height,
                pixelRatio: Math.min(window.devicePixelRatio, 2),
            };
        }

        // --- Scene Constants & Variables ---
        let renderer: THREE.WebGLRenderer;
        let scene: THREE.Scene;
        let perspectiveCamera: THREE.PerspectiveCamera;
        let rubiksCube = new THREE.Group();
        let rows: THREE.InstancedMesh[] = [];
        let dummy = new THREE.Object3D();

        // --- Setup Functions ---
        function setUpScene() {
            renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });
            const sizes = Sizes();
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.toneMapping = THREE.CineonToneMapping;
            renderer.toneMappingExposure = 1.75;
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            renderer.setPixelRatio(sizes.pixelRatio);
            renderer.setSize(sizes.width, sizes.height);
            container.appendChild(renderer.domElement);

            scene = new THREE.Scene();
        }

        function setUpCameras() {
            const sizes = Sizes();
            perspectiveCamera = new THREE.PerspectiveCamera(45, sizes.aspect, 1, 1000);
            perspectiveCamera.position.set(0, 1, -10);
            scene.add(perspectiveCamera);
        }

        function addLights() {
            const rightLight = new THREE.RectAreaLight(0xffffff, 5, 4, 3);
            rightLight.position.set(-5, 5, 0);
            rightLight.lookAt(0, 0, 0);
            scene.add(rightLight);

            const centerLight = new THREE.RectAreaLight(0xffffff, 5, 4, 3);
            centerLight.position.set(0, 0, 5.21);
            centerLight.lookAt(0, 0, 0);
            scene.add(centerLight);

            const rectLight3 = new THREE.RectAreaLight(0xffffff, 5, 1.84, 8);
            rectLight3.position.set(-2, 4, 0);
            rectLight3.lookAt(0, 0, 0);
            scene.add(rectLight3);

            const frontLight = new THREE.RectAreaLight(0xffffff, 5, 1.84, 8.89);
            frontLight.position.set(-4, 0, -3);
            frontLight.lookAt(0, 0, 0);
            scene.add(frontLight);
        }

        function generateCubeInstances() {
            // Using RoundedBoxGeometry from three-stdlib
            const cubeGeometry = new RoundedBoxGeometry(1, 1, 1, 4, 0.1);
            const cubeMat = new THREE.MeshPhysicalMaterial({
                color: 0x000000,
                emissive: 0x000000,
                specularColor: 0xffffff,
                roughness: 0,
                metalness: 1,
                iridescence: 1
            });

            for (let index = 0; index < 3; index++) {
                const cubeInstance = new THREE.InstancedMesh(cubeGeometry, cubeMat, 9);
                cubeInstance.receiveShadow = true;
                cubeInstance.castShadow = true;
                rows.push(cubeInstance);
            }
        }

        function arrangeCubes() {
            const offset = (3 - 1) / 2;

            rows.forEach((row, rowIdx) => {
                for (let colIdx = 0; colIdx < 9; colIdx++) {
                    const x = (colIdx % 3) * 1.1 - offset;
                    const y = Math.floor(colIdx / 3) * 1.1 - offset;
                    const z = rowIdx * 1.1;

                    dummy.position.set(x, y, z - 1);
                    dummy.updateMatrix();
                    row.setMatrixAt(colIdx, dummy.matrix);
                }
                row.instanceMatrix.needsUpdate = true;
                if (row.geometry.boundingSphere === null) row.geometry.computeBoundingSphere();
            });
        }

        function addCubesToScene() {
            rows.forEach((row) => {
                rubiksCube.add(row);
            });
            scene.add(rubiksCube);
        }

        let animationFrameId: number;
        function renderScene() {
            rubiksCube.rotation.y += 0.005 / 2;
            rubiksCube.rotation.x += 0.005;
            rubiksCube.rotation.z += 0.005 / 2;
            renderer.render(scene, perspectiveCamera);
            animationFrameId = requestAnimationFrame(renderScene);
        }

        async function animateRow() {
            // Check if children exist before animating
            if (rubiksCube.children.length < 3) return;

            // Dynamic import for animejs to avoid SSR/ESM issues
            const animeModule = await import('animejs');
            const anime = (animeModule as any).default || animeModule;

            anime({
                targets: rubiksCube.children[0].rotation,
                z: Math.PI / 2,
                easing: "easeInOutSine",
                delay: 6000,
                duration: 5000,
                direction: "alternate",
                loop: true,
            });
            setTimeout(() => {
                if (rubiksCube.children.length < 3) return;
                anime({
                    targets: rubiksCube.children[2].rotation,
                    z: -Math.PI,
                    easing: "easeInOutSine",
                    delay: 6000,
                    duration: 5000,
                    direction: "alternate",
                    loop: true
                });
            }, 1000);
            anime({
                targets: rubiksCube.children[1].rotation,
                z: -Math.PI / 2,
                easing: "linear",
                delay: 10000,
                duration: 6000,
                direction: "alternate",
                loop: true
            });
        }

        function onWindowResize() {
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            const s = Sizes();

            perspectiveCamera.aspect = w / h;
            perspectiveCamera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }

        // --- Init ---
        // Clean up any previous children
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        setUpScene();
        setUpCameras();
        generateCubeInstances();
        arrangeCubes();
        addCubesToScene();
        addLights();

        renderScene();
        animateRow();

        const resizeObserver = new ResizeObserver(onWindowResize);
        resizeObserver.observe(container);

        // --- Cleanup ---
        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);
            // anime.remove skipped as dynamic import makes ref tricky and not strictly needed for page transitions here
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            // Dispose geometries and materials
            rows.forEach(row => {
                row.geometry.dispose();
                if (Array.isArray(row.material)) row.material.forEach(m => m.dispose());
                else row.material.dispose();
            });
        };
    }, []);

    return (
        <div ref={containerRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1, transform: 'translateX(20%)' }} />
    );
}
