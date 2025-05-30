import { useNavigate, Link, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import AuthContext from "../context/AuthProvider";

import InstrumentSpecDialog from "../InstrInstrument/InstrumentSpecDialog";

import Header from "../header/Header";

const HomeComponent = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const userId = auth?.userId;
    const roles = auth?.roles || [];

    const location = useLocation();

    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        if (location.state?.openDialog) {
            setShowDialog(true);
        }
    }, [location.state]);

    const logout = async () => {
        setAuth({});
        localStorage.removeItem("auth");
        navigate('/linkpage');
    }

    return (
        <section>
            <Header roles={roles} userId={userId} onOpenDialog={() => setShowDialog(true)} />

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

            <InstrumentSpecDialog isOpen={showDialog} onClose={() => setShowDialog(false)} />
        </section>
    )
}

export default HomeComponent