import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/redux/store'

export interface ThemeState {
    value: boolean
}

const initialState: ThemeState = {
    // true: light, false: dark
    value: true
}

export const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        update: (state, action: PayloadAction<boolean>) => {
            state.value = action.payload
        }
    }
})

export const theme = (state: RootState) => state.theme.value

export const { update } = themeSlice.actions

export default themeSlice.reducer