import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useContext } from "react";

import AuthContext from "../context/AuthProvider";

import HeaderCSS from './header.module.css';
import { FiUser } from "react-icons/fi";
import { FiLogOut } from 'react-icons/fi';
import { FaGuitar } from 'react-icons/fa';
import { FaUsers } from 'react-icons/fa';
import { FaUserPlus } from "react-icons/fa";
import { FaGraduationCap } from 'react-icons/fa';

import logo from '../assets/MCAcademy_logo.png';

const AdminHeader = ({ userId }) => {
    const { setAuth } = useContext(AuthContext);

    const navigate = useNavigate();

    const handleUsers = () => {
        navigate(`/users`);
    }

    const handleUserProfile = () => {
        navigate(`/profile/${userId}`);
    }

    const logout = async () => {
        setAuth({});
        localStorage.removeItem("auth");
    }

    return (
        <nav className={HeaderCSS.nav}>
            <button onClick={handleUsers} className={HeaderCSS.iconButton} title="Users">
                <FaUsers size={25} />
            </button>
            <button onClick={() => handleUserProfile(userId)} className={HeaderCSS.iconButton} title="My profile">
                <FiUser size={25} />
            </button>
            <button onClick={logout} className={HeaderCSS.iconButton} title="Log out">
                <FiLogOut size={25} />
            </button>
        </nav>
    );
};

const InstructorHeader = ({ userId, onOpenDialog }) => {
    const { setAuth } = useContext(AuthContext);

    const navigate = useNavigate();

    const handleCourses = () => {
        navigate('/courses');
    };

    const handleValidateStudents = () => {
        navigate('/validate-student');
    };

    const handleAssignInstrument = () => {
        navigate('/', { state: { openDialog: true } });
    };

    const handleUserProfile = () => {
        navigate(`/profile/${userId}`);
    };

    const logout = async () => {
        setAuth({});
        localStorage.removeItem("auth");
    }

    return (
        <nav className={HeaderCSS.nav}>
            <button onClick={handleCourses} className={HeaderCSS.iconButton} title="Courses">
                <FaGraduationCap size={25} />
            </button>
            <button onClick={handleValidateStudents} className={HeaderCSS.iconButton} title="Validate students">
                <FaUserPlus size={25} />
            </button>
            <button onClick={handleAssignInstrument} className={HeaderCSS.iconButton} title="Assign instrument">
                <FaGuitar size={25} />
            </button>
            <button onClick={() => handleUserProfile(userId)} className={HeaderCSS.iconButton} title="My profile">
                <FiUser size={25} />
            </button>
            <button onClick={logout} className={HeaderCSS.iconButton} title="Log out">
                <FiLogOut size={25} />
            </button>
        </nav>
    );
};

const StudentHeader = ({ userId }) => {
    const { setAuth } = useContext(AuthContext);

    const handleCourses = () => {
        navigate('/courses');
    };

    const navigate = useNavigate();

    const handleAssignSpec = () => {
        navigate(`/assign-instr`);
    }

    const handleUserProfile = (userId) => {
        navigate(`/profile/${userId}`);
    }

    const logout = async () => {
        setAuth({});
        localStorage.removeItem("auth");
    }

    return (
        <nav className={HeaderCSS.nav}>
            <button onClick={handleCourses} className={HeaderCSS.iconButton} title="Courses">
                <FaGraduationCap size={25} />
            </button>
            <button onClick={handleAssignSpec} className={HeaderCSS.iconButton} title="Assign instrument">
                <FaGuitar size={25} />
            </button>
            <button onClick={() => handleUserProfile(userId)} className={HeaderCSS.iconButton} title="My profile">
                <FiUser size={25} />
            </button>
            <button onClick={logout} className={HeaderCSS.iconButton} title="Log out">
                <FiLogOut size={25} />
            </button>
        </nav>
    );
};

const DefaultHeader = () => {
    const navigate = useNavigate();

    const handleSignIn = () => {
        navigate('/register');
    };

    const handleSignUp = () => {
        navigate('/login');
    };


    return (
        <nav className={HeaderCSS.nav}>
            <button onClick={handleSignIn} className={HeaderCSS.homeButton}>Sign Up</button>
            <button onClick={handleSignUp} className={HeaderCSS.homeButton}>Sign In</button>
        </nav>
    );
};


const Header = ({ roles = [], userId, onOpenDialog }) => {

    const Logo = (
        <Link to="/">
            <img
                src={logo}
                alt="MusicFlow Logo"
                className={HeaderCSS.logo}
            />
        </Link>
    );

    if (roles.includes("ADMIN")) {
        return (
            <header className={HeaderCSS.header}>
                {Logo}
                <AdminHeader userId={userId} />
            </header>
        );
    }
    else if (roles.includes("INSTRUCTOR")) {
        return (
            <header className={HeaderCSS.header}>
                {Logo}
                <InstructorHeader userId={userId} onOpenDialog={onOpenDialog} />
            </header>
        );
    }
    else if (roles.includes("STUDENT")) {
        return (
            <header className={HeaderCSS.header}>
                {Logo}
                <StudentHeader userId={userId} />
            </header>
        );
    }
    else {
        return (
            <header className={HeaderCSS.header}>
                {Logo}
                <DefaultHeader />
            </header>
        );
    }

};

export default Header;
