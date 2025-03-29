import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import AuthContext from "../context/AuthProvider";

import { getUserByEmail } from "../service/UserService";

const StudentComponent = () => {

    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            const authData = localStorage.getItem("auth");
            const parsedAuth = authData ? JSON.parse(authData) : null;
            const email = parsedAuth?.email || null;

            if (email) {
                try {
                    const user = await getUserByEmail(email);
                    setUserId(user.id);
                } catch (error) {
                    console.error("Failed to fetch user:", error);
                }
            }
        };

        fetchUser();
    }, []);

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