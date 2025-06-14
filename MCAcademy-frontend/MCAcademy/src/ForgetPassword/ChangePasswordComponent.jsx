import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from 'react-router-dom';

import changePasswordCSS from './changePassword.module.css';

// Regular expressions for validation
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%_]).{8,24}$/;

const ChangePasswordComponent = () => {
    const navigator = useNavigate();

    // State variables for form fields and validation
    const [newPassword, setNewPassword] = useState('');
    const [validNewPassword, setValidNewPassword] = useState(false);

    const [repetPassword, setRepeatPassword] = useState('');
    const [validRepetPassword, setValidRepetPassword] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [searchParams] = useSearchParams();

    const confirmToken = searchParams.get("token");

    // Error messages for each field
    const [passwordError, setPasswordError] = useState('');
    const [matchPwdError, setMatchPwdError] = useState('');

    // Validate all fields on change
    useEffect(() => {
        const result = PASSWORD_REGEX.test(newPassword);
        setValidNewPassword(result);
        setPasswordError(
            newPassword && !result
                ? "Password must be 8-24 chars, include uppercase, lowercase, a number, and a special character (!@#$%_)."
                : ''
        );

        const match = newPassword === repetPassword;
        setValidRepetPassword(match);
        setMatchPwdError(
            repetPassword && !match
                ? "Passwords don't match."
                : ''
        );
    }, [newPassword, repetPassword]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const password = { newPassword, repetPassword }
        if (confirmToken === null || confirmToken === '') {
            setErrMsg("You didn't verify your email, go to Log In!");
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/v1/forgotpassword/reset?token=${confirmToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(password),
                withCredentials: true
            })

            setNewPassword('');
            setRepeatPassword('');

            navigator('/login');
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 409) {
                setErrMsg('Username Taken');
            } else {
                setErrMsg('Registration Failed')
            }
        }
    }

    return (
        <div className={changePasswordCSS.wrapper}>
            <section className={changePasswordCSS.section}>

                {/* Error messages */}
                <p className={errMsg ? changePasswordCSS.errmsg : changePasswordCSS.offscreen} aria-live="assertive">
                    {errMsg}
                </p>

                {/* Form for changing password */}
                <h1>Change password</h1>
                <form onSubmit={handleSubmit} className={changePasswordCSS.form}>
                    <div className={changePasswordCSS.formGroup}>
                        <input
                            type="password"
                            id="password"
                            placeholder="Password"
                            className={changePasswordCSS.formField}
                            onChange={(e) => setNewPassword(e.target.value)}
                            value={newPassword}
                            required
                            aria-invalid={validNewPassword ? "false" : "true"}
                        />
                        {passwordError && <p className={changePasswordCSS.inputError}>{passwordError}</p>}
                        <label htmlFor="password" className={changePasswordCSS.formLabel}>Password</label>
                    </div>

                    <div className={changePasswordCSS.formGroup}>
                        <input
                            type="password"
                            id="confirm_pwd"
                            placeholder="Confirm password"
                            className={changePasswordCSS.formField}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                            value={repetPassword}
                            required
                            aria-invalid={validRepetPassword ? "false" : "true"}
                        />
                        {matchPwdError && <p className={changePasswordCSS.inputError}>{matchPwdError}</p>}
                        <label htmlFor="confirm_pwd" className={changePasswordCSS.formLabel}>Confirm Password</label>
                    </div>

                    {/* Submit button */}
                    <button disabled={!validNewPassword || !validRepetPassword ? true : false} className={changePasswordCSS.button}>Change</button>
                </form>

                {/* Navigate to Log in */}
                <p className={changePasswordCSS.line}>
                    <span className={changePasswordCSS.promptText}>Already registered?</span>{' '}
                    <a href='/login' className={changePasswordCSS.signUpLink}>Sign In</a>
                </p>

            </section>
        </div>
    )
}

export default ChangePasswordComponent