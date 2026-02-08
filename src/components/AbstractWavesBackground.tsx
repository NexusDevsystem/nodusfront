
import React from 'react';

const AbstractWavesBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 overflow-hidden bg-[#E0F7FA]">
            <style>{`
                @keyframes wave-drift {
                    0% { transform: translateX(0) translateZ(0) scaleY(1); }
                    50% { transform: translateX(-25%) translateZ(0) scaleY(0.8); }
                    100% { transform: translateX(-50%) translateZ(0) scaleY(1); }
                }
            `}</style>

            <svg className="absolute bottom-0 left-0 w-[200%] h-full opacity-60" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path
                    fill="#4DD0E1"
                    fillOpacity="0.4"
                    d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    className="origin-bottom animate-[wave-drift_15s_linear_infinite]"
                    style={{ animationDelay: '0s' }}
                />
                <path
                    fill="#00BCD4"
                    fillOpacity="0.4"
                    d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    className="origin-bottom animate-[wave-drift_20s_linear_infinite_reverse]"
                    style={{ animationDelay: '-5s' }}
                />
                <path
                    fill="#0097A7"
                    fillOpacity="0.4"
                    d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,122.7C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    className="origin-bottom animate-[wave-drift_25s_linear_infinite]"
                    style={{ animationDelay: '-10s' }}
                />
            </svg>
        </div>
    );
};

export default AbstractWavesBackground;
