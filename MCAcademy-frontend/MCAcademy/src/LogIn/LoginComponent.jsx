import { useRef, useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth';

import loginCSS from './logIn.module.css';
import logo from '../assets/MCAcademy_logo.png';
import VerifyEmailDialog from '../ForgetPassword/VerifyEmailDialog';

const LoginComponent = () => {

    const { setAuth } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const userRef = useRef();
    const errRef = useRef();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errMsg, setErrMsg] = useState('');

    const [showVerifyEmailDialog, setShowVerifyEmailDialog] = useState(false);

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [email, password])

    const handleSubmit = async (e) => {
        e.preventDefault();

        const user = { email, password };
        console.log(user);

        try {
            const response = await fetch('http://localhost:8080/api/v1/auth/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);

                const userId = data.userId;
                const accessToken = data.token;
                const refreshToken = data.refreshToken;
                const roles = Array.isArray(data.role) ? data.role : [data.role];
                setAuth({ userId, roles, accessToken, refreshToken });

                setEmail('');
                setPassword('');
                navigate("/", { replace: true });
            } else {
                let errorData = null;
                try {
                    errorData = await response.json();
                } catch (e) {
                    console.log('Something is wrong', e);
                }

                if (response.status == 400) {
                    setErrMsg(errorData?.message || 'Missing or invalid data');
                } else if (response.status == 401) {
                    setErrMsg(errorData?.message || 'Unauthorized');
                } else if (response.status == 403) {
                    setErrMsg(errorData?.message || 'Access forbidden');
                } else {
                    setErrMsg(errorData?.message || 'Login Failed');
                }

                errRef.current?.focus();
            }
        } catch (err) {
            setErrMsg('No Server Response');
            errRef.current?.focus();
        }
    };

    const toRegister = () => {
        navigate('/register');
    }

    return (
        <div className={loginCSS.wrapper}>
            <section className={loginCSS.section}>
                <p
                    ref={errRef}
                    className={`${loginCSS.errmsg} ${errMsg ? loginCSS.visible : ''}`}
                    aria-live="assertive"
                >
                    {errMsg}
                </p>
                <img
                    src={logo}
                    alt="MusicFlow Logo"
                    className={loginCSS.logo}
                />
                <h1 className={loginCSS.heading}>Log In</h1>
                <form onSubmit={handleSubmit} className={loginCSS.form}>
                    <div className={`${loginCSS.formGroup} ${email ? loginCSS.filled : ''}`}>
                        <input
                            type="email"
                            className={loginCSS.formField}
                            name="email"
                            placeholder='Email'
                            id="email"
                            ref={userRef}
                            autoComplete="off"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            required
                        />
                        <label htmlFor="email" className={loginCSS.formLabel}>Email</label>
                    </div>

                    <div className={loginCSS.formGroup}>
                        <input
                            type="password"
                            className={loginCSS.formField}
                            placeholder='Password'
                            name="password"
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                        />
                        <label htmlFor="password" className={loginCSS.formLabel}>Password</label>
                    </div>

                    <button className={loginCSS.button}>Log In</button>
                </form>

                <p className={loginCSS.line}>
                    <button className={loginCSS.link} type="button" onClick={toRegister}>
                        Need an Account?
                    </button>
                </p>
                <p className={loginCSS.line}>
                    <button
                        className={loginCSS.link}
                        onClick={() => setShowVerifyEmailDialog(true)}
                        type="button"
                    >
                        Forgot your password?
                    </button>
                </p>
            </section>

            {showVerifyEmailDialog && (
                <VerifyEmailDialog
                    isOpen={showVerifyEmailDialog}
                    onClose={() => setShowVerifyEmailDialog(false)}
                />
            )}
        </div>
    );
}

export default LoginComponent