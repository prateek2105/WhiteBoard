import { configureStore } from '@reduxjs/toolkit'
import menuReducer from './menuSlice'
import toolboxReducer from './toolboxSlice'
import boardReducer from './boardSlice'

export const store = configureStore({
    reducer: {
        menu: menuReducer,
        toolbox: toolboxReducer,
        board: boardReducer
    }
})
