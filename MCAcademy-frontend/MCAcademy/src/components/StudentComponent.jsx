import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";

import AuthContext from "../context/AuthProvider";

const StudentComponent = () => {

    const { auth, setAuth } = useContext(AuthContext);
    const userId = auth?.userId;

    const navigate = useNavigate();

    const myCourses = () => {
        navigate('/courses')
    }

    const AssignInstrSpec = () => {
        navigate('/assign-spec')
    }

    const handleUserProfile = (userId) => {
        navigate(`/profile/${userId}`);
    }

    const logout = async () => {
        setAuth({});
        localStorage.removeItem("auth");
        navigate('/linkpage');
    }

    return (
        <div>
            <h1>Students page</h1>
            <button onClick={AssignInstrSpec}>Assign instructor spec</button>
            <button onClick={myCourses}>My courses</button>
            <button onClick={() => handleUserProfile(userId)}>My profile</button>
            <button onClick={logout}>Log Out</button>
        </div>
    )
}

export default StudentComponent;