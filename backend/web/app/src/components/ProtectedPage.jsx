import { Navigate } from 'react-router-dom'
import AuthApi from '../contexts/AuthApi';
import React from 'react';
// import { ValidateSession } from '../helpers/AuthenticateUser';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../store';


export const ProtectedPage = ({ component: Component }) => {
    const { auth, setAuth } = React.useContext(AuthApi);
    const empUserList = useSelector((state) => state);
    const dispatch = useDispatch();
    React.useEffect(() => {
        dispatch(fetchUsers());




        // async function fetchRes(){
        //     const res = await ValidateSession(); //TO CHECK WHETHER SESSION IS VALID OR NOT
        //     setAuthLoading(false)   //SETTING LOADING FALSE
        //     setAuth(res[0]);//UPDATING ,AUTH STATE == isSessionValid
        //     setUsers(res[1]); //UPDATING,users list

        //     /* res[0] -> isValidSession(boolean)
        //     res[1] -> usersList(array)
        //     */
        // }        
        // fetchRes();
    }, []);

    React.useEffect(() => {

        setAuth(empUserList.auth);
    }, [setAuth]);

    if (empUserList.loading) return <div>Loading..</div>
    return (
        empUserList.auth ?
            (<Component data={empUserList.users} />) //render component if auth success
            :
            <Navigate to="/login" replace={true} /> //redirectReplace if auth fails



    );
}