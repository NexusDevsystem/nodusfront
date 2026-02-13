import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Stars, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// 1. Synthwave Night
export const SynthwaveBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#0a001a] overflow-hidden">
            <Canvas camera={{ position: [0, 2, 10], fov: 75 }}>
                <color attach="background" args={['#0a001a']} />
                <gridHelper args={[100, 50, '#ff00ff', '#2d004d']} rotation={[0, 0, 0]} position={[0, 0, 0]} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ff00ff" />
                <fog attach="fog" args={['#0a001a', 5, 30]} />
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-t from-[#ff00ff1a] to-transparent pointer-events-none" />
        </div>
    );
};

// 2. Audio Pulse
export const AudioPulseBackground: React.FC = () => {
    const bars = useMemo(() => {
        return Array.from({ length: 20 }).map((_, i) => ({
            x: (i - 10) * 1.2,
            h: 1 + Math.random() * 5,
            delay: Math.random() * 2
        }));
    }, []);

    const Bars = () => {
        const groupRef = useRef<THREE.Group>(null);
        useFrame(({ clock }) => {
            if (groupRef.current) {
                groupRef.current.children.forEach((child, i) => {
                    const bar = bars[i];
                    const scale = 1 + Math.sin(clock.elapsedTime * 3 + bar.delay) * 2.5;
                    child.scale.y = scale;
                    child.position.y = scale / 2;
                });
            }
        });

        return (
            <group ref={groupRef}>
                {bars.map((bar, i) => (
                    <mesh key={i} position={[bar.x, 0, 0]}>
                        <boxGeometry args={[0.8, 1, 0.8]} />
                        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} />
                    </mesh>
                ))}
            </group>
        );
    };

    return (
        <div className="absolute inset-0 bg-[#020617]">
            <Canvas camera={{ position: [0, 5, 20], fov: 45 }}>
                <color attach="background" args={['#020617']} />
                <Bars />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} color="#3b82f6" intensity={2} />
                <Stars radius={50} depth={50} count={1000} factor={2} />
                <fog attach="fog" args={['#020617', 10, 50]} />
            </Canvas>
        </div>
    );
};

// 3. Vinyl Groove
export const VinylBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#121212] flex items-center justify-center overflow-hidden">
            <div className="relative w-[150%] aspect-square animate-[spin_20s_linear_infinite] opacity-30">
                <div className="absolute inset-0 rounded-full border-[60px] border-[#1a1a1a] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
                <div className="absolute inset-0 rounded-full border-[120px] border-[#1a1a1a]/50" />
                <div className="absolute inset-0 rounded-full border-[180px] border-[#1a1a1a]/30" />
                <div className="absolute inset-0 rounded-full border-[2px] border-white/5" />
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#ff6b00] rounded-full shadow-[0_0_20px_#ff6b00]" />
        </div>
    );
};

// 4. Electric Storm
export const ElectricStormBackground: React.FC = () => {
    const Particles = () => {
        const meshRef = useRef<THREE.Points>(null);
        const count = 500;
        const positions = useMemo(() => {
            const pos = new Float32Array(count * 3);
            for (let i = 0; i < count; i++) {
                pos[i * 3] = (Math.random() - 0.5) * 40;
                pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
                pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
            }
            return pos;
        }, []);

        useFrame(({ clock }) => {
            if (meshRef.current) {
                meshRef.current.rotation.y = clock.elapsedTime * 0.1;
                meshRef.current.rotation.z = clock.elapsedTime * 0.05;
            }
        });

        return (
            <points ref={meshRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={count}
                        array={positions}
                        itemSize={3}
                        args={[positions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial size={0.15} color="#2dd4bf" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
            </points>
        );
    };

    return (
        <div className="absolute inset-0 bg-[#00040a]">
            <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
                <color attach="background" args={['#00040a']} />
                <Particles />
                <Stars radius={100} depth={50} count={3000} factor={4} saturation={1} fade speed={2} />
                <ambientLight intensity={0.2} />
                <pointLight position={[0, 0, 0]} color="#2dd4bf" intensity={5} distance={20} />
            </Canvas>
        </div>
    );
};

// 5. Jazz Lounge
export const JazzBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#1a0105] overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#2d0208] to-transparent" />
            <div className="absolute top-0 left-1/4 w-[1px] h-full bg-amber-500/20 shadow-[0_0_50px_amber]" />
            <div className="absolute top-0 right-1/4 w-[1px] h-full bg-amber-500/10 shadow-[0_0_30px_amber]" />
            <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
                <fog attach="fog" args={['#1a0105', 1, 15]} />
                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                    <mesh position={[2, -1, 0]}>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="#450a0a" roughness={0.1} />
                    </mesh>
                </Float>
                <ambientLight intensity={0.5} />
                <spotLight position={[0, 10, 5]} angle={0.15} penumbra={1} intensity={10} color="#fbbf24" castShadow />
            </Canvas>
        </div>
    );
};

// 6. Acoustic Vibe
export const AcousticBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#1c0d02] overflow-hidden">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <color attach="background" args={['#1c0d02']} />
                <Stars radius={50} depth={50} count={1000} factor={2} saturation={1} />
                <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                    <mesh position={[0, 0, -2]}>
                        <sphereGeometry args={[3, 32, 32]} />
                        <MeshDistortMaterial color="#451a03" speed={2} distort={0.3} radius={1} />
                    </mesh>
                </Float>
                <ambientLight intensity={0.8} />
                <pointLight position={[5, 5, 5]} color="#f59e0b" intensity={2} />
            </Canvas>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10 pointer-events-none" />
        </div>
    );
};

// 7. Lo-Fi Beats
export const LofiBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#2d1b4d] overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2d1b4d] via-[#1e1431] to-[#0f0a1a]" />
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-[80%] h-[80%] bg-[#ff9ffc]/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#5227ff]/10 rounded-full blur-[80px] animate-bounce" style={{ animationDuration: '10s' }} />
            </div>
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};

// 8. Pop Star
export const PopBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#ec4899] overflow-hidden">
            <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
                <color attach="background" args={['#ec4899']} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} />
                <Float speed={5} rotationIntensity={2} floatIntensity={2}>
                    <mesh position={[0, 0, 0]}>
                        <octahedronGeometry args={[2, 0]} />
                        <meshStandardMaterial color="#f472b6" roughness={0} metalness={1} />
                    </mesh>
                </Float>
                <ambientLight intensity={1} />
                <pointLight position={[10, 10, 10]} color="#ffffff" intensity={2} />
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#db2777]/50 to-transparent" />
        </div>
    );
};

// 9. Techno Core
export const TechnoBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-black overflow-hidden font-mono text-[10px] text-[#00ff41] opacity-40">
            <div className="absolute inset-0 grid grid-cols-12 gap-1 px-2">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2 animate-[matrix_2s_linear_infinite]" style={{ animationDelay: `${i * 0.2}s` }}>
                        {Array.from({ length: 40 }).map((_, j) => (
                            <span key={j}>{Math.random() > 0.5 ? '0' : '1'}</span>
                        ))}
                    </div>
                ))}
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes matrix {
                    0% { transform: translateY(-50%); }
                    100% { transform: translateY(0%); }
                }
            `}} />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>
    );
};

// 10. Classical Harmony
export const ClassicalBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#f8f5f0] overflow-hidden">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <color attach="background" args={['#f8f5f0']} />
                <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
                    <mesh rotation={[0, 0, Math.PI / 4]}>
                        <torusGeometry args={[10, 0.01, 16, 100]} />
                        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0} />
                    </mesh>
                    <mesh rotation={[0, 0, -Math.PI / 4]}>
                        <torusGeometry args={[8, 0.01, 16, 100]} />
                        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0} />
                    </mesh>
                </Float>
                <ambientLight intensity={1} />
                <pointLight position={[5, 5, 5]} color="#fff" intensity={1} />
            </Canvas>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-30 pointer-events-none" />
        </div>
    );
};
