import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import HeaderCSS from './header.module.css';

import logo from '../assets/MCAcademy_logo.png';

const AdminHeader = ({ userId }) => {
    const navigate = useNavigate();

    const handleUserProfile = () => {
        navigate(`/profile/${userId}`);
    }

    return (
        <nav className={HeaderCSS.nav}>
            <Link to="/admin">Dashboard</Link>
            <Link to="/users">Users</Link>
            <button onClick={() => handleUserProfile(userId)} className={HeaderCSS.navButton}>Profile</button>
        </nav>
    );
};

const InstructorHeader = ({ userId, onOpenDialog }) => {
    const navigate = useNavigate();

    const handleUserProfile = () => {
        navigate(`/profile/${userId}`);
    };

    const handleValidateStudents = () => {
        navigate('/validate-student');
    };

    const handleAssignInstrument = () => {
        navigate('/', { state: { openDialog: true } });
    };

    return (
        <nav className={HeaderCSS.nav}>
            <Link to="/courses">Courses</Link>
            <button onClick={handleValidateStudents}>Validate students</button>
            <button onClick={handleAssignInstrument}>Assign Instrument</button>
            <button onClick={handleUserProfile} className={HeaderCSS.navButton}>Profile</button>
        </nav>
    );
};

const StudentHeader = ({ userId }) => {
    const navigate = useNavigate();

    const handleUserProfile = (userId) => {
        navigate(`/profile/${userId}`);
    }

    return (
        <nav className={HeaderCSS.nav}>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
            <button onClick={() => handleUserProfile(userId)} className={HeaderCSS.navButton}>Profile</button>
        </nav>
    );
};

const DefaultHeader = () => (
    <nav className={HeaderCSS.nav}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/login">Login</Link>
    </nav>
);

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
    if (roles.includes("INSTRUCTOR")) {
        return (
            <header className={HeaderCSS.header}>
                {Logo}
                <InstructorHeader userId={userId} onOpenDialog={onOpenDialog} />
            </header>
        );
    }
    if (roles.includes("STUDENT")) {
        return (
            <header className={HeaderCSS.header}>
                {Logo}
                <StudentHeader userId={userId} />
            </header>
        );
    }
    return (
        <header className={HeaderCSS.header}>
            {Logo}
            <DefaultHeader />
        </header>
    );
};

export default Header;
