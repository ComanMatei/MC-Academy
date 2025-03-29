import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthProvider";

import { getUserByEmail } from "../service/UserService";

const InstructorComponent = () => {

    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const [userId, setUserId] = useState('');

    useEffect(() => {
        const authData = localStorage.getItem("auth");
        const parsedAuth = authData ? JSON.parse(authData) : null;
        const email = parsedAuth?.email || null;

        const fetchUser = async () => {
            const user = await getUserByEmail(email);
            setUserId(user.id);
        }

        fetchUser();
    }, []);

    const toAssignPage = () => {
        navigate('/assign-instrument')
    }

    const validateStudentsPage = () => {
        navigate('/validate-student')
    }

    const myCourses = () => {
        navigate('/courses')
    }

    const logout = async () => {
        setAuth({});
        localStorage.removeItem("auth");
        navigate('/linkpage');
    }

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
            <button onClick={logout}>Log Out</button>
        </div>
    )
}

export default InstructorComponent;