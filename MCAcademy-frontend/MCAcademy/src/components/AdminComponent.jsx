import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminComponent = () => {

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