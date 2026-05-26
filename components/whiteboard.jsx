import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import rough from 'roughjs/bundled/rough.cjs.js';
import { MENU_ITEMS } from '../src/constants';
import { addElement, updateElement, removeElement, saveCanvasImage } from '../src/store/boardSlice';
import Menu from './Menu';
import Toolbox from './Toolbox';

const isPointInElement = (x, y, element) => {
    const { type, startX, startY, endX, endY, points } = element;
    const offset = 10; // 10px buffer for easier clicking

    if (type === MENU_ITEMS.RECTANGLE) {
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY, endY);
        return x >= minX - offset && x <= maxX + offset && y >= minY - offset && y <= maxY + offset;
    }

    if (type === MENU_ITEMS.CIRCLE) {
        const centerX = (startX + endX) / 2;
        const centerY = (startY + endY) / 2;
        const radiusX = Math.abs(endX - startX) / 2;
        const radiusY = Math.abs(endY - startY) / 2;
        const radius = Math.max(radiusX, radiusY); // Approximate for rough circle
        
        const dx = x - centerX;
        const dy = y - centerY;
        return dx * dx + dy * dy <= (radius + offset) * (radius + offset);
    }

    if (type === MENU_ITEMS.LINE) {
        const a = { x: startX, y: startY };
        const b = { x: endX, y: endY };
        const c = { x, y };
        const distance = Math.abs((b.y - a.y) * c.x - (b.x - a.x) * c.y + b.x * a.y - b.y * a.x) / Math.sqrt(Math.pow(b.y - a.y, 2) + Math.pow(b.x - a.x, 2));
        
        // Also check if point is within the line bounds
        const minX = Math.min(startX, endX) - offset;
        const maxX = Math.max(startX, endX) + offset;
        const minY = Math.min(startY, endY) - offset;
        const maxY = Math.max(startY, endY) + offset;

        return distance < offset && x >= minX && x <= maxX && y >= minY && y <= maxY;
    }

    if (type === MENU_ITEMS.PENCIL || type === MENU_ITEMS.ERASER) {
        return points.some((point) => {
            const dx = point.x - x;
            const dy = point.y - y;
            return dx * dx + dy * dy < offset * offset;
        });
    }

    return false;
};

const Whiteboard = () => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentElementId, setCurrentElementId] = useState(null);

    const dispatch = useDispatch();
    const activeMenuItem = useSelector((state) => state.menu.activeMenuItem);
    const actionMenuItem = useSelector((state) => state.menu.actionMenuItem);
    const { color, size } = useSelector((state) => state.toolbox[activeMenuItem]) || {};
    const elements = useSelector((state) => state.board.elements);

    // Handle action items (Undo/Redo)
    useEffect(() => {
        if (!actionMenuItem) return;
        
        if (actionMenuItem === MENU_ITEMS.UNDO) {
            dispatch(undo());
        } else if (actionMenuItem === MENU_ITEMS.REDO) {
            dispatch(redo());
        }
        
        dispatch(actionItemClick(null));
    }, [actionMenuItem, dispatch]);

    // Initialize canvas context
    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            // Reapply current Redux styles so native lines (Pencil) don't reset to default black 1px
            context.strokeStyle = color || 'black';
            context.lineWidth = size || 5; 

            contextRef.current = context;
            // Re-render all elements after resize
            renderElements();
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [color, size, elements]); // added dependencies so handleResize uses fresh Redux data

    // Render loop whenever elements array changes
    const renderElements = () => {
        if (!contextRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = contextRef.current;
        const roughCanvas = rough.canvas(canvas);

        // Clear entire canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw everything
        elements.forEach((element) => {
            if (element.type === MENU_ITEMS.ERASER) return; // Legacy eraser lines won't paint white anymore out of caution

            const options = {
                stroke: element.color,
                strokeWidth: element.size,
                roughness: 1,
                seed: element.seed // use the stored seed to prevent shaking
            };

            if (element.type === MENU_ITEMS.PENCIL) {
                context.beginPath();
                context.strokeStyle = element.color;
                context.lineWidth = element.size;
                if (element.points.length > 0) {
                    context.moveTo(element.points[0].x, element.points[0].y);
                    for (let i = 1; i < element.points.length; i++) {
                        context.lineTo(element.points[i].x, element.points[i].y);
                    }
                    context.stroke();
                }
            } else if (element.type === MENU_ITEMS.LINE) {
                roughCanvas.line(element.startX, element.startY, element.endX, element.endY, options);
            } else if (element.type === MENU_ITEMS.RECTANGLE) {
                roughCanvas.rectangle(element.startX, element.startY, element.endX - element.startX, element.endY - element.startY, options);
            } else if (element.type === MENU_ITEMS.CIRCLE) {
                const centerX = (element.startX + element.endX) / 2;
                const centerY = (element.startY + element.endY) / 2;
                roughCanvas.ellipse(centerX, centerY, Math.abs(element.endX - element.startX), Math.abs(element.endY - element.startY), options);
            }
        });
    };

    // Re-render when elements array updates
    useEffect(() => {
        renderElements();
    }, [elements]);

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        setIsDrawing(true);

        if (activeMenuItem === MENU_ITEMS.ERASER) {
            // Instantly erase on click if hovering an element
            for (let i = elements.length - 1; i >= 0; i--) {
                if (isPointInElement(offsetX, offsetY, elements[i])) {
                    dispatch(removeElement(elements[i].id));
                    break;
                }
            }
            return;
        }

        const id = Date.now().toString(); // Simple unique ID
        setCurrentElementId(id);
        
        const seed = Math.floor(Math.random() * 100000); // Generate a unique seed for this element

        if (activeMenuItem === MENU_ITEMS.PENCIL) {
            dispatch(addElement({
                id,
                type: activeMenuItem,
                points: [{ x: offsetX, y: offsetY }],
                color: color || 'black',
                size: size || 5,
                seed
            }));
        } else {
            // Shapes
            dispatch(addElement({
                id,
                type: activeMenuItem,
                startX: offsetX,
                startY: offsetY,
                endX: offsetX,
                endY: offsetY,
                color: color || 'black',
                size: size || 5,
                seed
            }));
        }
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;

        if (activeMenuItem === MENU_ITEMS.ERASER) {
            // Erase on drag
            for (let i = elements.length - 1; i >= 0; i--) {
                if (isPointInElement(offsetX, offsetY, elements[i])) {
                    dispatch(removeElement(elements[i].id));
                    break;
                }
            }
            return;
        }

        if (!currentElementId) return;
        
        if (activeMenuItem === MENU_ITEMS.PENCIL) {
            // Find current element points and append
            const currentElement = elements.find(el => el.id === currentElementId);
            if (currentElement) {
                dispatch(updateElement({
                    id: currentElementId,
                    updatedData: { points: [...currentElement.points, { x: offsetX, y: offsetY }] }
                }));
            }
        } else {
            // Update shape end coordinates
            dispatch(updateElement({
                id: currentElementId,
                updatedData: { endX: offsetX, endY: offsetY }
            }));
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        setCurrentElementId(null);
        
        if (canvasRef.current) {
            // Wait for next frame so the final drawn element is fully captured
            requestAnimationFrame(() => {
                if (canvasRef.current) {
                    const dataURL = canvasRef.current.toDataURL('image/png');
                    dispatch(saveCanvasImage(dataURL));
                }
            });
        }
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
