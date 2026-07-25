'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import CityBuildings from './CityBuildings';
import FloatingPins from './FloatingPins';
import ParticleSystem from './ParticleSystem';
import CameraRig from './CameraRig';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

export default function PuneSkyline() {
    return (
        <div className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }}>
            <Canvas
                camera={{ position: [0, 50, 150], fov: 60 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 2]}
            >
                {/* Lighting */}
                <ambientLight intensity={0.3} />
                <directionalLight position={[10, 10, 5]} intensity={0.5} />
                <pointLight position={[0, 50, 0]} intensity={0.5} color="#14b8a6" />

                {/* Gradient Background */}
                <color attach="background" args={['#020617']} />
                <fog attach="fog" args={['#1e293b', 50, 300]} />

                <Suspense fallback={null}>
                    {/* 3D Scene Components */}
                    <CityBuildings />
                    <FloatingPins />
                    <ParticleSystem />
                    <CameraRig />

                    {/* Post-Processing Effects */}
                    <EffectComposer>
                        <Bloom
                            intensity={0.5}
                            luminanceThreshold={0.2}
                            luminanceSmoothing={0.9}
                        />
                    </EffectComposer>
                </Suspense>
            </Canvas>
        </div>
    );
}
