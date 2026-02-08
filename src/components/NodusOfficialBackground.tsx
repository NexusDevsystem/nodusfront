import React from 'react';
import Grainient from './Grainient';

const NodusOfficialBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 z-0 bg-[#0f1f1a]">
            <Grainient
                color1="#97cd7a"
                color2="#4e764c"
                color3="#a3f0d2"
                timeSpeed={5}
                colorBalance={0}
                warpStrength={1}
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
            {/* Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
        </div>
    );
};

export default NodusOfficialBackground;
