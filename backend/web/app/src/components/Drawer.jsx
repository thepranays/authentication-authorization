import React from 'react';
import './Drawer.css';
import { DestroySession } from '../helpers/AuthenticateUser';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faSignOutAlt } from '@fortawesome/fontawesome-free-solid'
export default function DashboardDrawer() {

    const navigate = useNavigate(); //navigator
    const handleLogout = async (e) => {
        e.preventDefault();//to avoid reloading page

        const res = await DestroySession(); //Destroy session and delete token cookies
        if (res) {
            navigate("/login", { replace: true }); //redirect to login (WITH REPLACE)
        }
    }

    return (<div className='dashboard-drawer'>
        <div className="drawer-org">
            <h5>DreamFist</h5>
            <img className="drawer-org-image" src="https://yt3.googleusercontent.com/ytc/AOPolaRhzp5rXp3jQVETHEXIal5rVYt1B9ngFIBsR-m8ig=s176-c-k-c0x00ffffff-no-rj" alt=" " />
        </div>

        <div className='drawer-tiles'>
            <li style={{ cursor: "pointer" }}>

                <ul style={{ color: "white" }}><FontAwesomeIcon icon={faUsers} style={{ marginRight: "5px" }} /> Employees</ul>
                <ul style={{ color: "white" }} onClick={handleLogout} ><FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: "10px" }} /> Logout</ul>
            </li>


        </div>

    </div >);
}