/* eslint-disable react/no-unknown-property */
import { Canvas, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial, RoundedBox, Environment } from '@react-three/drei';
import { useMemo } from 'react';

interface FluidGlassProps {
    active?: boolean;
}

const GlassContent = ({ active }: { active?: boolean }) => {
    const { viewport } = useThree();

    // Calculate radius based on typical button ratios
    // Button height is typically small, so radius should be limited by height
    const radius = Math.min(viewport.width, viewport.height) * 0.45; // Approximates rounded-full for buttons

    const materialProps = useMemo(() => ({
        samples: 6,
        resolution: 256,
        transmission: 0.95, // Slightly less than 1 to catch some light
        roughness: 0.1, // Slight roughness for visibility
        thickness: 0.5, // Thinner glass
        ior: 1.5, // Standard glass IOR
        chromaticAberration: 0.06,
        anisotropy: 0.1,
        distortion: 0.5,
        distortionScale: 0.4,
        temporalDistortion: 0.2, // Movement
        color: '#ffffff',
        attenuationColor: '#ffffff',
        attenuationDistance: 0.5,
    }), []);

    return (
        <>
            <Environment preset="city" />
            <ambientLight intensity={1} />
            <RoundedBox
                args={[viewport.width, viewport.height, 0.1]} // Much thinner box
                radius={radius}
                smoothness={4}
            >
                <MeshTransmissionMaterial {...materialProps} />
            </RoundedBox>
        </>
    );
};

export default function FluidGlass({ active }: FluidGlassProps) {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none rounded-[inherit] overflow-hidden">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                gl={{ alpha: true, antialias: false }} // Disable antialias for perf
                dpr={[1, 1.5]} // Cap DPR for perf
            >
                <ambientLight intensity={0.5} />
                <GlassContent active={active} />
            </Canvas>
        </div>
    );
}
