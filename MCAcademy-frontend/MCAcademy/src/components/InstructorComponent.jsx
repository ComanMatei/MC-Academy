import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

import AuthContext from "../context/AuthProvider";

const InstructorComponent = () => {

    const { auth, setAuth } = useContext(AuthContext);
    const userId = auth?.userId;

    const navigate = useNavigate();

    const toAssignPage = () => {
        navigate('/assign-instrument')
    }

    const validateStudentsPage = () => {
        navigate('/validate-student')
    }

    const myCourses = () => {
        navigate('/courses')
    }

    const handleLogout = () => {
        setAuth({ userId: '', roles: [], accessToken: '', refreshToken: '' });
        localStorage.removeItem("auth");
        navigate("/", { replace: true, state: null });
    };

    const handleUserProfile = (userId) => {
        navigate(`/profile/${userId}`);
    }

    return (
        <div>
            <h1>Instructors page</h1>
            <button onClick={toAssignPage}>Choose course instrument</button>
            <button onClick={validateStudentsPage}>Validate students</button>
            <button onClick={myCourses}>My courses</button>
            <button onClick={() => handleUserProfile(userId)}>My profile</button>
            <button onClick={handleLogout}>Log Out</button>
        </div>
    )
}

export default InstructorComponent;