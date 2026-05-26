import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    elements: [],
    actionHistory: [], // Stores a timeline of actions { action: 'ADD'|'REMOVE', element: {} }
    historyPointer: -1, // Points to the current position in actionHistory
    savedImageData: null
};

const boardSlice = createSlice({
    name: 'board',
    initialState,
    reducers: {
        setElements: (state, action) => {
            state.elements = action.payload;
        },
        addElement: (state, action) => {
            state.elements.push(action.payload);
            // Slice off any redo history when a new action occurs
            state.actionHistory = state.actionHistory.slice(0, state.historyPointer + 1);
            state.actionHistory.push({ action: 'ADD', element: action.payload });
            state.historyPointer++;
        },
        updateElement: (state, action) => {
            const { id, updatedData } = action.payload;
            const index = state.elements.findIndex(el => el.id === id);
            if (index !== -1) {
                state.elements[index] = { ...state.elements[index], ...updatedData };
                
                // Also seamlessly update the element representation in the actionHistory
                if (state.historyPointer >= 0) {
                   state.actionHistory[state.historyPointer].element = { ...state.elements[index] };
                }
            }
        },
        removeElement: (state, action) => {
            const index = state.elements.findIndex(el => el.id === action.payload);
            if (index !== -1) {
                const removedElement = state.elements.splice(index, 1)[0];
                state.actionHistory = state.actionHistory.slice(0, state.historyPointer + 1);
                state.actionHistory.push({ action: 'REMOVE', element: removedElement });
                state.historyPointer++;
            }
        },
        undo: (state) => {
            if (state.historyPointer >= 0) {
                const lastAction = state.actionHistory[state.historyPointer];
                
                if (lastAction.action === 'ADD') {
                    // Undo an ADD by removing the element
                    state.elements = state.elements.filter(el => el.id !== lastAction.element.id);
                } else if (lastAction.action === 'REMOVE') {
                    // Undo a REMOVE by restoring the element
                    state.elements.push(lastAction.element);
                }
                
                state.historyPointer--;
            }
        },
        redo: (state) => {
            if (state.historyPointer < state.actionHistory.length - 1) {
                state.historyPointer++;
                const nextAction = state.actionHistory[state.historyPointer];
                
                if (nextAction.action === 'ADD') {
                    // Redo an ADD by putting the element back
                    state.elements.push(nextAction.element);
                } else if (nextAction.action === 'REMOVE') {
                    // Redo a REMOVE by deleting the element again
                    state.elements = state.elements.filter(el => el.id !== nextAction.element.id);
                }
            }
        },
        saveCanvasImage: (state, action) => {
            state.savedImageData = action.payload;
        }
    }
});

export const { setElements, addElement, updateElement, removeElement, undo, redo, saveCanvasImage } = boardSlice.actions;
export default boardSlice.reducer;
