'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import PuneTiles from '@/components/3d/PuneTiles';
import GraphPins from '@/components/3d/GraphPins';
import NeonRoutes from '@/components/3d/NeonRoutes';
import CameraRig from '@/components/3d/CameraRig';
import PostProcessing from '@/components/3d/PostProcessing';
import HeroContent from '@/components/hero/HeroContent';

export default function Pune3DTilesHero() {
    return (
        <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-black via-indigo-950/50 to-slate-900">
            {/* 3D Canvas */}
            <Canvas
                camera={{
                    position: [40, 30, 40],
                    fov: 50,
                    near: 0.1,
                    far: 1000,
                }}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance',
                }}
                dpr={[1, 2]} // Responsive pixel ratio
            >
                <Suspense fallback={null}>
                    {/* Lighting */}
                    <ambientLight intensity={0.3} />
                    <directionalLight
                        position={[50, 50, 25]}
                        intensity={1.5}
                        castShadow
                        shadow-mapSize-width={2048}
                        shadow-mapSize-height={2048}
                    />
                    <pointLight position={[-50, 50, -25]} intensity={0.5} color="#a855f7" />
                    <pointLight position={[50, 50, -25]} intensity={0.5} color="#06b6d4" />

                    {/* Background stars */}
                    <Stars
                        radius={300}
                        depth={50}
                        count={3000}
                        factor={4}
                        saturation={0}
                        fade
                        speed={0.5}
                    />

                    {/* Scroll controls for camera interaction */}
                    <ScrollControls pages={3} damping={0.1}>
                        {/* Google 3D Tiles - Photorealistic Pune buildings */}
                        <PuneTiles />

                        {/* GraphRAG Pins - Location markers */}
                        <GraphPins />

                        {/* Neon Routes - Connections between pins */}
                        <NeonRoutes />

                        {/* Camera Animation */}
                        <CameraRig />
                    </ScrollControls>

                    {/* Fallback orbit controls (disabled when auto-animating) */}
                    <OrbitControls
                        enablePan={false}
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={10}
                        maxDistance={100}
                        minPolarAngle={Math.PI / 6}
                        maxPolarAngle={Math.PI / 2}
                    />

                    {/* Post-processing effects */}
                    <PostProcessing />
                </Suspense>
            </Canvas>

            {/* Hero Content Overlay */}
            <HeroContent />

            {/* Loading indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/50 text-sm flex items-center gap-2 pointer-events-none">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>Loading 3D Pune...</span>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 right-8 text-white/50 text-sm flex flex-col items-center gap-2 pointer-events-none animate-bounce">
                <span>Scroll to explore</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </div>
    );
}
