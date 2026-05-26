import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { menuItemClick, actionItemClick } from '../src/store/menuSlice'
import { MENU_ITEMS } from '../src/constants'
import { Pencil, Eraser, Undo, Redo, Download, Square, Circle, Minus } from 'lucide-react'
import styles from './Menu.module.css'

const Menu = () => {
    const dispatch = useDispatch()
    const activeMenuItem = useSelector((state) => state.menu.activeMenuItem)
    const savedImageData = useSelector((state) => state.board.savedImageData)

    const handleMenuClick = (itemName) => {
        dispatch(menuItemClick(itemName))
    }

    const handleDownload = () => {
        if (!savedImageData) return;
        
        const link = document.createElement('a');
        link.download = `whiteboard-${Date.now()}.png`;
        link.href = savedImageData;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleActionClick = (itemName) => {
        if (itemName === MENU_ITEMS.DOWNLOAD) {
            handleDownload();
        } else {
            dispatch(actionItemClick(itemName))
        }
    }

    return (
        <div className={styles.menuContainer}>
            {/* Tools */}
            <button 
                onClick={() => handleMenuClick(MENU_ITEMS.PENCIL)}
                className={`${styles.iconWrapper} ${activeMenuItem === MENU_ITEMS.PENCIL ? styles.active : ''}`}
                title="Pencil"
            >
                <Pencil size={24} />
            </button>
            <button 
                onClick={() => handleMenuClick(MENU_ITEMS.ERASER)}
                className={`${styles.iconWrapper} ${activeMenuItem === MENU_ITEMS.ERASER ? styles.active : ''}`}
                title="Eraser"
            >
                <Eraser size={24} />
            </button>

            {/* Shapes */}
            <div className={styles.divider} /> {/* Divider */}
            
            <button 
                onClick={() => handleMenuClick(MENU_ITEMS.RECTANGLE)}
                className={`${styles.iconWrapper} ${activeMenuItem === MENU_ITEMS.RECTANGLE ? styles.active : ''}`}
                title="Rectangle"
            >
                <Square size={24} />
            </button>
            <button 
                onClick={() => handleMenuClick(MENU_ITEMS.CIRCLE)}
                className={`${styles.iconWrapper} ${activeMenuItem === MENU_ITEMS.CIRCLE ? styles.active : ''}`}
                title="Circle"
            >
                <Circle size={24} />
            </button>
            <button 
                onClick={() => handleMenuClick(MENU_ITEMS.LINE)}
                className={`${styles.iconWrapper} ${activeMenuItem === MENU_ITEMS.LINE ? styles.active : ''}`}
                title="Line"
            >
                <Minus size={24} />
            </button>

            {/* Actions */}
            <div className={styles.divider} /> {/* Divider */}

            <button 
                onClick={() => handleActionClick(MENU_ITEMS.UNDO)}
                className={styles.iconWrapper}
                title="Undo"
            >
                <Undo size={24} />
            </button>
            <button 
                onClick={() => handleActionClick(MENU_ITEMS.REDO)}
                className={styles.iconWrapper}
                title="Redo"
            >
                <Redo size={24} />
            </button>
            <button 
                onClick={() => handleActionClick(MENU_ITEMS.DOWNLOAD)}
                className={styles.iconWrapper}
                title="Download"
            >
                <Download size={24} />
            </button>
        </div>
    )
}

export default Menu
