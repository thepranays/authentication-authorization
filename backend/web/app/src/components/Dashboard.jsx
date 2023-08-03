import React, { useState } from "react"

import { CreateUserForm } from "./CreateUserForm";
import { User } from "./User";
import './Dashboard.css';
import DashboardDrawer from './Drawer';
export const Dashbaord = (props) => {
    const [showModal, setShowModal] = useState(false);


    //Returns user as list item
    const userItems = props.data.map((user) => {
        return (<tr key={user["username"]} >

            <User id={user["ID"]} username={user["username"]} org={user["org"]} usertype={user["usertype"]} createdon={user["createdon"]} updatedon={user["updatedon"]} />

        </tr>)
    });

    const openCreateUserModal = () => {
        setShowModal(true);
    }
    const closeCreateUserModal = () => {
        setShowModal(false);
    }

    return (
        <div className="dashboard-screen">
            <DashboardDrawer />
            <div className="dashboard-container">
                <div className='dash-nav'>
                    <nav className="navbar bg-body-tertiary">
                        <div className="container-fluid">
                            <a className="navbar-brand" href="#">
                                <img src="https://cdn-icons-png.flaticon.com/512/482/482636.png?w=826&t=st=1691000569~exp=1691001169~hmac=7b3319e912cde0d75fe8d83683f895aaf67e859b812dcf8c318ad3b6fceabb09" alt="Logo" width="30" height="24" className="d-inline-block align-text-top" />
                                Employee list
                                <div className="dash-button">
                                    <button type="button" class="btn btn-primary dash-button-create" onClick={openCreateUserModal}>Add employee</button>

                                </div>
                            </a>

                        </div>

                    </nav>
                </div>
                <div className="dashboard-list">

                    <div className="table-responsive ">
                        <table class="table table-hover" >
                            <thead>
                                <tr>
                                    <th scope="col">Employee Name</th>
                                    <th scope="col">Organisation</th>
                                    <th scope="col">User-Type</th>
                                    <th scope="col">Created On</th>
                                    <th scope="col">Updated On</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userItems}
                            </tbody>
                        </table>
                    </div>



                    {showModal &&
                        <CreateUserForm closeModal={closeCreateUserModal} />}

                </div>

            </div>
        </div>
    )
}
