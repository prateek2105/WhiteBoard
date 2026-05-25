import { configureStore } from '@reduxjs/toolkit'
import menuReducer from './menuSlice'
import toolboxReducer from './toolboxSlice'

export const store = configureStore({
    reducer: {
        menu: menuReducer,
        toolbox: toolboxReducer
    }
})
