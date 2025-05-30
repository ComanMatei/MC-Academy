import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import AuthContext from "../context/AuthProvider";

const AdminComponent = () => {

    const { auth } = useContext(AuthContext);
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

    // Stiluri inline pentru secțiunea și butoane
    const sectionStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '50px',
        gap: '20px',
        padding: '20px',
        backgroundColor: '#f0f4f8',
        borderRadius: '10px',
        maxWidth: '300px',
        marginLeft: 'auto',
        marginRight: 'auto',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    };

    const buttonStyle = {
        padding: '12px 20px',
        fontSize: '16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: '#0b1b77',
        color: 'white',
        transition: 'background-color 0.3s ease',
        width: '100%'
    };

    const buttonHoverStyle = {
        backgroundColor: '#09306d'
    };

    // Optional: You can add hover effect by CSS classes or a small component,
    // but here keeping it simple without extra libs.

    return (
        <section style={sectionStyle}>
            <button 
                style={buttonStyle} 
                onClick={listOfUsers}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#09306d'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#0b1b77'}
            >
                List of all users
            </button>
            <button 
                style={buttonStyle} 
                onClick={() => handleUserProfile(userId)}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#09306d'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#0b1b77'}
            >
                My profile
            </button>
            <button 
                style={buttonStyle} 
                onClick={BackHome}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#09306d'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#0b1b77'}
            >
                Back to menu
            </button>
        </section>
    )
}

export default AdminComponent;
