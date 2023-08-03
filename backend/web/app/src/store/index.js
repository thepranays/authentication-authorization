import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { ValidateSession } from '../helpers/AuthenticateUser';


const initialEmpListState = {
    users: [],
    responseCode: '',
    loading: true,
    auth: false,

}

//to fetch user list
export const fetchUsers = createAsyncThunk('users/fetchUsers', () => {
    return ValidateSession().then((data) => data);
});

export const employeeListSlice = createSlice({
    name: 'users',
    initialState: initialEmpListState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchUsers.pending, (state) => {
            state.loading = true;

        }); builder.addCase(fetchUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.responseCode = action.payload[2];
            state.auth = action.payload[0];
            if (action.payload[0]) {
                state.auth = true;
                state.users = action.payload[1];
            }




        });

        builder.addCase(fetchUsers.rejected, (state, action) => {
            state.loading = false;
            state.responseCode = action.payload[2];
            state.auth = false;
            state.users = [];

        });

    }
});

const store = configureStore({
    extraReducers: employeeListSlice.extraReducers,
    reducer: employeeListSlice.reducer
});

export default store;