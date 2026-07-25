'use client';

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export default function PostProcessing() {
    return (
        <EffectComposer>
            {/* Bloom effect for glowing pins and routes */}
            <Bloom
                intensity={1.5}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                height={400}
                blendFunction={BlendFunction.ADD}
            />

            {/* Subtle vignette for cinematic feel */}
            <Vignette
                offset={0.3}
                darkness={0.5}
                blendFunction={BlendFunction.NORMAL}
            />
        </EffectComposer>
    );
}
