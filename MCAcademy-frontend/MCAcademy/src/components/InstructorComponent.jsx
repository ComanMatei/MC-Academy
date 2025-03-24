import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthProvider";

const InstructorComponent = () => {

    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const [userId, setUserId] = useState('');

    useEffect(() => {
        const authData = localStorage.getItem("auth");
        const parsedAuth = authData ? JSON.parse(authData) : null;
        const email = parsedAuth?.email || null;

        getUser(email);
    }, []);

    const getUser = async (email) => {

        try {
            const response = await fetch(`http://localhost:8080/api/v1/user/email/${email}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);

                setUserId(data.id);
            } else {
                console.error('Error:', response.status);
            }
        } catch (err) {
            console.error("Eroare:", err);
        }
    }

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