import { useNavigate} from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthProvider";

const InstructorComponent = () => {

    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const toAssignPage = () => {
        navigate('/assign-instrument')
    }

    const validateStudentsPage = () => {
        navigate('/validate-student')
    }

    const logout = async () => {
        // if used in more components, this should be in context 
        // axios to /logout endpoint 
        setAuth({});
        sessionStorage.removeItem("auth");
        navigate('/linkpage');
    }

    return (
        <div>
            <h1>Instructors page</h1>
            <button onClick={toAssignPage}>Choose course instrument</button>
            <button onClick={validateStudentsPage}>Validate students</button>
            <button>My courses</button>
            <button>My profile</button>
            <button onClick={logout}>Log Out</button>
        </div>
    )
}

export default InstructorComponent;