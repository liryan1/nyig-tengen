import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export const completionSlice = createSlice({
  name: "completion",
  initialState: {
    psetId: null,
  },
  reducers: {
    setPsetCompletion: (state, action) => {
      state.psetId = action.payload;
    },
    clearCompletion: (state) => {
      state.psetId = null;
    },
  },
});

export const selectPsetCompletion = (state: RootState) => state.completion;
export const { setPsetCompletion, clearCompletion } = completionSlice.actions;
export default completionSlice.reducer;
