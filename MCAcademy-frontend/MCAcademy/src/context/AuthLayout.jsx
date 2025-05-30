import Header from "../header/Header";
import { Outlet } from "react-router-dom";
import { useContext } from "react";

import AuthContext from "../context/AuthProvider";

const AuthLayout = () => {
    const { auth } = useContext(AuthContext);
    const roles = auth?.roles;
    const userId = auth?.userId;

    return (
        <>
            <Header roles={roles} userId={userId} />
            <main className="App">
                <Outlet />
            </main>
        </>
    );
};

export default AuthLayout;
