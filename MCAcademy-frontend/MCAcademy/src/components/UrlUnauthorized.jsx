import { useNavigate } from "react-router-dom"
import { useContext } from "react";

import AuthContext from "../context/AuthProvider";

const UrlUnauthorized = () => {
    const { auth } = useContext(AuthContext);
    const userId = auth?.userId;

    const navigate = useNavigate();

    const backToProfile = () => {
        navigate(`/`);
    }

    return (
        <section>
            <h1>URL Unauthorized</h1>
            <br />
            <p>You do not have access to another profile.</p>
            <div className="flexGrow">
                <button onClick={backToProfile}>Main menu</button>
            </div>
        </section>
    )
}

export default UrlUnauthorized