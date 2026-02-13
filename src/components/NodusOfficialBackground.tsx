import React from 'react';
import Grainient from './Grainient';

const NodusOfficialBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-black pointer-events-none z-[-1] h-full w-full">
            <Grainient
                color1="#206204"
                color2="#274527"
                color3="#098b60"
                timeSpeed={4.65}
                colorBalance={0}
                warpStrength={0}
                warpFrequency={5}
                warpSpeed={2}
                warpAmplitude={50}
                blendAngle={0}
                blendSoftness={0.05}
                rotationAmount={500}
                noiseScale={2}
                grainAmount={0.1}
                grainScale={2}
                grainAnimated={false}
                contrast={1.5}
                gamma={1}
                saturation={1}
                centerX={0}
                centerY={0}
                zoom={0.9}
            />
        </div>
    );
};

export default NodusOfficialBackground;
