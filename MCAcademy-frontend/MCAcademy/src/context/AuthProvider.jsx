import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { jwtDecode } from "jwt-decode";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        const savedAuth = localStorage.getItem("auth");
        return savedAuth ? JSON.parse(savedAuth) : { userId: '', roles: [], accessToken: '', refreshToken: '' };
    });

    const navigate = useNavigate();

    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp < currentTime + 60;
        } catch {
            return true;
        }
    };

    useEffect(() => {
        localStorage.setItem("auth", JSON.stringify(auth));
    }, [auth]);

    useEffect(() => {
        const refreshAccessToken = async () => {
            if (!auth?.refreshToken) return;

            try {
                const response = await fetch("http://localhost:8080/api/v1/auth/refresh-token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ refreshToken: auth.refreshToken })
                });

                if (response.ok) {
                    const data = await response.json();
                    setAuth(prev => ({
                        ...prev,
                        accessToken: data.token
                    }));
                } else {
                    console.warn("Refresh token invalid sau expirat");
                    logout();
                }
            } catch (err) {
                logout();
            }
        };

        const logout = () => {
            setAuth({});
            localStorage.removeItem("auth");
            navigate("/login");
        };

        const checkAndRefreshToken = () => {
            if (auth?.accessToken && isTokenExpired(auth.accessToken)) {
                refreshAccessToken();
            }
        };

        const interval = setInterval(() => {
            checkAndRefreshToken();
        }, 60 * 1000);

        checkAndRefreshToken();

        return () => clearInterval(interval);
    }, [auth?.refreshToken]);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
