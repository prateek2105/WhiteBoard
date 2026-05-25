import React, { useRef, useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import rough from 'roughjs/bundled/rough.esm.js';
import Menu from './Menu';
import Toolbox from './Toolbox';
import { MENU_ITEMS } from '../src/constants';

const Whiteboard = () => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const snapshotRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

    const activeMenuItem = useSelector((state) => state.menu.activeMenuItem);
    const { color, size } = useSelector((state) => state.toolbox[activeMenuItem]) || {};

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        // Set canvas to full screen and maintain sizes
        const handleResize = () => {
            // Store current context styles before resize clears them
            const currentColor = contextRef.current?.strokeStyle || 'black';
            const currentSize = contextRef.current?.lineWidth || 5;

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Reapply styles
            context.lineCap = 'round';
            context.strokeStyle = currentColor;
            context.lineWidth = currentSize;
            contextRef.current = context;
        };

        // Initialize size
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Effect to update context styles when color or size changes in Redux
    useEffect(() => {
        if (contextRef.current && color && size) {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = size;
        }
    }, [color, size]);

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setStartPosition({ x: offsetX, y: offsetY });
        setIsDrawing(true);

        // Save the current canvas state so we can restore it while dragging shapes
        snapshotRef.current = contextRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        
        // Let pencil and eraser draw freely
        if (activeMenuItem === MENU_ITEMS.PENCIL || activeMenuItem === MENU_ITEMS.ERASER) {
            // White out the canvas stroke if eraser is selected
            if (activeMenuItem === MENU_ITEMS.ERASER) {
                contextRef.current.strokeStyle = 'white';
            } else {
                contextRef.current.strokeStyle = color || 'black';
            }
            contextRef.current.lineTo(offsetX, offsetY);
            contextRef.current.stroke();
        } else if (
            activeMenuItem === MENU_ITEMS.LINE ||
            activeMenuItem === MENU_ITEMS.RECTANGLE ||
            activeMenuItem === MENU_ITEMS.CIRCLE
        ) {
            // Restore snapshot to remove previous temporary shape
            contextRef.current.putImageData(snapshotRef.current, 0, 0);

            // Draw current temporary shape
            const roughCanvas = rough.canvas(canvasRef.current);
            const options = {
                stroke: color || 'black',
                strokeWidth: size || 5,
                roughness: 1
            };

            if (activeMenuItem === MENU_ITEMS.LINE) {
                roughCanvas.line(startPosition.x, startPosition.y, offsetX, offsetY, options);
            } else if (activeMenuItem === MENU_ITEMS.RECTANGLE) {
                roughCanvas.rectangle(startPosition.x, startPosition.y, offsetX - startPosition.x, offsetY - startPosition.y, options);
            } else if (activeMenuItem === MENU_ITEMS.CIRCLE) {
                const centerX = (startPosition.x + offsetX) / 2;
                const centerY = (startPosition.y + offsetY) / 2;
                roughCanvas.ellipse(centerX, centerY, Math.abs(offsetX - startPosition.x), Math.abs(offsetY - startPosition.y), options);
            }
        }
    };

    const stopDrawing = (e) => {
        if (!isDrawing) return;

        if (
            activeMenuItem === MENU_ITEMS.LINE ||
            activeMenuItem === MENU_ITEMS.RECTANGLE ||
            activeMenuItem === MENU_ITEMS.CIRCLE
        ) {
            // Restore one last time and draw the final shape
            contextRef.current.putImageData(snapshotRef.current, 0, 0);
            
            const { offsetX, offsetY } = e.nativeEvent;
            const roughCanvas = rough.canvas(canvasRef.current);
            const options = {
                stroke: color || 'black',
                strokeWidth: size || 5,
                roughness: 1
            };

            if (activeMenuItem === MENU_ITEMS.LINE) {
                roughCanvas.line(startPosition.x, startPosition.y, offsetX, offsetY, options);
            } else if (activeMenuItem === MENU_ITEMS.RECTANGLE) {
                roughCanvas.rectangle(startPosition.x, startPosition.y, offsetX - startPosition.x, offsetY - startPosition.y, options);
            } else if (activeMenuItem === MENU_ITEMS.CIRCLE) {
                const centerX = (startPosition.x + offsetX) / 2;
                const centerY = (startPosition.y + offsetY) / 2;
                roughCanvas.ellipse(centerX, centerY, Math.abs(offsetX - startPosition.x), Math.abs(offsetY - startPosition.y), options);
            }
        }

        contextRef.current.closePath();
        setIsDrawing(false);
    };

    return (
        <>
            <Menu />
            <Toolbox />
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
        </>
    );
};

export default Whiteboard;
