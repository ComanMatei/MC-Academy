import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import AuthContext from "../context/AuthProvider";

const AdminComponent = () => {

    const { auth, setAuth } = useContext(AuthContext);
    const userId = auth?.userId;

    const navigate = useNavigate();

    const handleUserProfile = (userId) => {
        navigate(`/profile/${userId}`);
    }

    const listOfUsers = () => {
        navigate('/users')
    }

    const BackHome = () => {
        navigate('/')
    }

    return (
        <section>
            <button onClick={listOfUsers}>List of all users</button>
            <button onClick={() => handleUserProfile(userId)}>My profile</button>
            <button onClick={BackHome}>Back to menu</button>
        </section>
    )
}

export default AdminComponent;