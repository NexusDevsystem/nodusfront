
import React, { useEffect, useRef } from 'react';

const SpaceWarpBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let stars: { x: number; y: number; z: number }[] = [];
        const numStars = 400;
        const speed = 2; // Warp speed

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        const init = () => {
            stars = [];
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width - canvas.width / 2,
                    y: Math.random() * canvas.height - canvas.height / 2,
                    z: Math.random() * canvas.width
                });
            }
        };

        const animate = () => {
            if (!ctx) return;
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height); // Clear with black

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            stars.forEach(star => {
                star.z -= speed;
                if (star.z <= 0) {
                    star.x = Math.random() * canvas.width - canvas.width / 2;
                    star.y = Math.random() * canvas.height - canvas.height / 2;
                    star.z = canvas.width;
                }

                const x = (star.x / star.z) * 100 + cx;
                const y = (star.y / star.z) * 100 + cy;
                const size = (1 - star.z / canvas.width) * 3;

                // Draw star trail effect
                const prevX = (star.x / (star.z + speed * 2)) * 100 + cx;
                const prevY = (star.y / (star.z + speed * 2)) * 100 + cy;

                ctx.strokeStyle = `rgba(255, 255, 255, ${1 - star.z / canvas.width})`;
                ctx.lineWidth = size;
                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(x, y);
                ctx.stroke();
            });

            requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        init();
        animate();

        return () => window.removeEventListener('resize', resize);
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full bg-black" />;
};

export default SpaceWarpBackground;
