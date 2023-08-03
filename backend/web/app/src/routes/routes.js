import React from 'react';
import {
    Route,
    Routes,

} from 'react-router-dom';
import { Dashbaord } from '../components/Dashboard';
import { LoginForm } from '../components/LoginForm';
import { ProtectedPage } from '../components/ProtectedPage';
import { Provider } from 'react-redux';
import store from '../store';





export const Routing = () => {

    return (
        <Routes>
            <Route path="/" element={<Provider store={store}><ProtectedPage component={Dashbaord} /></Provider>} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/dashboard" element={<Provider store={store}><ProtectedPage component={Dashbaord} /></Provider>} />
        </Routes>
    )
}
