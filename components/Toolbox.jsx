import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { changeColor, changeBrushSize } from '../src/store/toolboxSlice'
import { COLORS } from '../src/constants'
import styles from './Toolbox.module.css'

const Toolbox = () => {
    const dispatch = useDispatch()
    const activeMenuItem = useSelector((state) => state.menu.activeMenuItem)
    const { color, size } = useSelector((state) => state.toolbox[activeMenuItem])

    const updateBrushSize = (e) => {
        dispatch(changeBrushSize({ item: activeMenuItem, size: e.target.value }))
    }

    const updateColor = (newColor) => {
        dispatch(changeColor({ item: activeMenuItem, color: newColor }))
    }

    return (
        <div className={styles.toolboxContainer}>
            <div className={styles.toolItem}>
                <h4 className={styles.toolText}>Color</h4>
                <div className={styles.itemContainer}>
                    <div 
                        className={`${styles.colorBox} ${color === COLORS.BLACK ? styles.active : ''}`} 
                        style={{ backgroundColor: COLORS.BLACK }} 
                        onClick={() => updateColor(COLORS.BLACK)} 
                    />
                    <div 
                        className={`${styles.colorBox} ${color === COLORS.RED ? styles.active : ''}`} 
                        style={{ backgroundColor: COLORS.RED }} 
                        onClick={() => updateColor(COLORS.RED)} 
                    />
                    <div 
                        className={`${styles.colorBox} ${color === COLORS.GREEN ? styles.active : ''}`} 
                        style={{ backgroundColor: COLORS.GREEN }} 
                        onClick={() => updateColor(COLORS.GREEN)} 
                    />
                    <div 
                        className={`${styles.colorBox} ${color === COLORS.BLUE ? styles.active : ''}`} 
                        style={{ backgroundColor: COLORS.BLUE }} 
                        onClick={() => updateColor(COLORS.BLUE)} 
                    />
                    <div 
                        className={`${styles.colorBox} ${color === COLORS.ORANGE ? styles.active : ''}`} 
                        style={{ backgroundColor: COLORS.ORANGE }} 
                        onClick={() => updateColor(COLORS.ORANGE)} 
                    />
                    <div 
                        className={`${styles.colorBox} ${color === COLORS.YELLOW ? styles.active : ''}`} 
                        style={{ backgroundColor: COLORS.YELLOW }} 
                        onClick={() => updateColor(COLORS.YELLOW)} 
                    />
                </div>
            </div>

            <div className={styles.toolItem}>
                <h4 className={styles.toolText}>Size</h4>
                <div className={styles.sliderContainer}>
                    <input 
                        type="range" 
                        min={1} 
                        max={10} 
                        step={1} 
                        onChange={updateBrushSize} 
                        value={size} 
                        className={styles.slider} 
                    />
                </div>
            </div>
        </div>
    )
}

export default Toolbox
