import React, { useRef, useEffect, useState } from 'react'
const Whiteboard = () => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        // Set canvas to full screen and maintain sizes
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            context.lineCap = 'round';
            context.strokeStyle = 'black';
            context.lineWidth = 5;
            contextRef.current = context;
        };

        // Initialize size
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    };

    const stopDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    return (
        <canvas 
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{ 
                display: 'block', 
                width: '100vw', 
                height: '100vh',
                margin: 0,
                padding: 0
            }}
        />
    );
};

export default Whiteboard;
