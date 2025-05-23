import { useNavigate, Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthProvider";

const HomeComponent = () => {
    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const logout = async () => {
        // if used in more components, this should be in context 
        // axios to /logout endpoint 
        setAuth({});
        localStorage.removeItem("auth");
        navigate('/linkpage');
    }

    return (
        <section>
            <h1>Home</h1>
            <br />
            <p>You are logged in!</p>
            <br />
            <Link to="/instructor">Go to the Instructor page</Link>
            <br />
            <Link to="/admin">Go to the Admin page</Link>
            <br />
            <Link to="/student">Go to the Student page</Link>
            <div className="flexGrow">
                <button onClick={logout}>Sign Out</button>
            </div>
        </section>
    )
}

export default HomeComponent