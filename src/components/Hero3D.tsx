import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, useTexture } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import * as THREE from 'three';

function ParticleField(props: any) {
    const ref = useRef<any>();
    // Generate 5000 particles in a sphere
    const sphere = useMemo(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }), []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#acc8a2"
                    size={0.002}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.6}
                />
            </Points>
        </group>
    );
}

function LogoCenter() {
    const texture = useTexture('/icons/logo-sem-fundo.png'); // Assuming filename correction
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            // Subtle breathing effect
            const t = state.clock.getElapsedTime();
            meshRef.current.position.y = Math.sin(t / 1.5) * 0.1;
            meshRef.current.rotation.z = Math.sin(t / 2) * 0.05;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <mesh ref={meshRef}>
                <planeGeometry args={[1.5, 1.5]} /> {/* Adjust size as needed */}
                <meshBasicMaterial map={texture} transparent opacity={0.9} />
            </mesh>
            {/* Glow effect behind logo */}
            <mesh position={[0, 0, -0.1]}>
                <circleGeometry args={[0.8, 32]} />
                <meshBasicMaterial color="#acc8a2" transparent opacity={0.3} blurriness={1} />
            </mesh>
        </Float>
    );
}

export default function Hero3D() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
                {/* Ambient Light */}
                <ambientLight intensity={0.5} />

                {/* Particles */}
                <ParticleField />

                {/* User didn't ask for the logo in 3D specifically but as a centerpiece. 
            Using HTML overlay for logo usually sharper, but let's try 3D space if requested. 
            Actually, let's keep the logo as an HTML overlay for crispness and use 3D interactions around it.
        */}
                {/* <LogoCenter />  <-- Commented out to use high-quality HTML overlay instead for the logo itself, or enable if 3D texture is preferred */}

                {/* Connecting Lines / Network Effect */}
                {/* We can add more complex 3D shapes here */}
            </Canvas>
        </div>
    );
}
