import { createContext, useState, useEffect } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        const savedAuth = localStorage.getItem("auth");
        return savedAuth ? JSON.parse(savedAuth) : { userId: '', roles: [], accessToken: '', refreshToken: '' };
    });

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
                    setAuth({});
                    localStorage.removeItem("auth");
                }
            } catch (err) {
                setAuth({});
                localStorage.removeItem("auth");
            }
        };

        const interval = setInterval(() => {
            refreshAccessToken();
        }, 30 * 1000); 

        return () => clearInterval(interval);
    }, [auth?.refreshToken]);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;