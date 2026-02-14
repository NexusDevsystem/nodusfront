import React from 'react';
import { UserProfile, Theme } from '../types';
import NodusOfficialBackground from './NodusOfficialBackground';
import Iridescence from './Iridescence';
import PrismaticBurst from './PrismaticBurst';
import Beams from './Beams';
import Silk from './Silk';
import {
    SynthwaveBackground, AudioPulseBackground, VinylBackground,
    ElectricStormBackground, JazzBackground, AcousticBackground,
    LofiBackground, PopBackground, TechnoBackground, ClassicalBackground
} from './MusicBackgrounds';
import { PixelBackground } from './CreativeBackgrounds';
import {
    KawaiiCloudsBackground, KawaiiStarsBackground, KawaiiGardenBackground,
    KawaiiPeachBackground, KawaiiMilkBackground, KawaiiRainbowBackground,
    KawaiiJellyBackground, KawaiiBakeryBackground, KawaiiSpaceBackground,
    KawaiiMatchaBackground, KawaiiSakuraBackground
} from './KawaiiBackgrounds';

interface BackgroundLayerProps {
    profile: UserProfile;
    currentTheme: Theme;
    className?: string;
    isStatic?: boolean;
}

const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ profile, currentTheme, className = "", isStatic = false }) => {
    // If static, return a simplified version for performance (previews)
    if (isStatic) {
        return (
            <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
                {profile.customSolidColor ? (
                    <div className="absolute inset-0" style={{
                        background: profile.customSecondaryColor
                            ? `linear-gradient(135deg, ${profile.customSolidColor}, ${profile.customSecondaryColor})`
                            : profile.customSolidColor
                    }}></div>
                ) : profile.customBackground ? (
                    <div className="absolute inset-0">
                        <img src={profile.customBackground} alt="Background" className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div
                        className={`absolute inset-0 ${currentTheme.backgroundClass}`}
                        style={currentTheme.category === 'solid' && profile.customSolidColor ? { backgroundColor: profile.customSolidColor } : {}}
                    ></div>
                )}
            </div>
        );
    }

    return (
        <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
            {profile.customSolidColor ? (
                <div className="absolute inset-0" style={{
                    background: profile.customSecondaryColor
                        ? `linear-gradient(135deg, ${profile.customSolidColor}, ${profile.customSecondaryColor})`
                        : profile.customSolidColor
                }}></div>
            ) : profile.customBackground ? (
                <div className="absolute inset-0">
                    <img src={profile.customBackground} alt="Background" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>
            ) : currentTheme.id === 'music-synth-wave' ? (
                <SynthwaveBackground />
            ) : currentTheme.id === 'music-audio-pulse' ? (
                <AudioPulseBackground />
            ) : currentTheme.id === 'music-vinyl-groove' ? (
                <VinylBackground />
            ) : currentTheme.id === 'music-electric-storm' ? (
                <ElectricStormBackground />
            ) : currentTheme.id === 'music-jazz-lounge' ? (
                <JazzBackground />
            ) : currentTheme.id === 'music-acoustic-vibe' ? (
                <AcousticBackground />
            ) : currentTheme.id === 'music-lofi-beats' ? (
                <LofiBackground />
            ) : currentTheme.id === 'music-pop-star' ? (
                <PopBackground />
            ) : currentTheme.id === 'music-techno-core' ? (
                <TechnoBackground />
            ) : currentTheme.id === 'music-classical-flow' ? (
                <ClassicalBackground />
            ) : currentTheme.id === 'kawaii-clouds' ? (
                <KawaiiCloudsBackground />
            ) : currentTheme.id === 'kawaii-stars' ? (
                <KawaiiStarsBackground />
            ) : currentTheme.id === 'kawaii-garden' ? (
                <KawaiiGardenBackground />
            ) : currentTheme.id === 'kawaii-peach' ? (
                <KawaiiPeachBackground />
            ) : currentTheme.id === 'kawaii-milk' ? (
                <KawaiiMilkBackground />
            ) : currentTheme.id === 'kawaii-rainbow' ? (
                <KawaiiRainbowBackground />
            ) : currentTheme.id === 'kawaii-jelly' ? (
                <KawaiiJellyBackground />
            ) : currentTheme.id === 'kawaii-bakery' ? (
                <KawaiiBakeryBackground />
            ) : currentTheme.id === 'kawaii-space' ? (
                <KawaiiSpaceBackground />
            ) : currentTheme.id === 'kawaii-matcha' ? (
                <KawaiiMatchaBackground />
            ) : currentTheme.id === 'kawaii-sakura' ? (
                <KawaiiSakuraBackground />
            ) : currentTheme.id === 'creative-pixel' ? (
                <PixelBackground />
            ) : currentTheme.id === 'animated-nodus-official' ? (
                <NodusOfficialBackground />
            ) : currentTheme.id === 'iridescence' ? (
                <Iridescence
                    color={[0.5, 0.6, 0.8]}
                    mouseReact
                    amplitude={0.1}
                    speed={1}
                />
            ) : currentTheme.id === 'prismatic-burst' ? (
                <PrismaticBurst
                    animationType="rotate3d"
                    intensity={2}
                    speed={0.5}
                    distort={0}
                    paused={false}
                    offset={{ x: 0, y: 0 }}
                    hoverDampness={0.25}
                    rayCount={0}
                    mixBlendMode="lighten"
                    colors={['#ff007a', '#4d3dff', '#ffffff']}
                />
            ) : currentTheme.id === 'beams' ? (
                <Beams
                    beamWidth={3}
                    beamHeight={30}
                    beamNumber={20}
                    lightColor="#ffffff"
                    speed={2}
                    noiseIntensity={1.75}
                    scale={0.2}
                    rotation={30}
                />
            ) : currentTheme.id === 'silk' ? (
                <Silk
                    speed={5}
                    scale={1}
                    color="#7B7481"
                    noiseIntensity={1.5}
                    rotation={0}
                />
            ) : (
                <div
                    className={`absolute inset-0 ${currentTheme.backgroundClass}`}
                    style={currentTheme.category === 'solid' && profile.customSolidColor ? { backgroundColor: profile.customSolidColor } : {}}
                ></div>
            )}
        </div>
    );
};

export default BackgroundLayer;
