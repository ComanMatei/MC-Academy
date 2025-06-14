import { useRef, useState, useEffect } from 'react'

import verifyEmailCSS from './verifyEmail.module.css';

const VerifyEmailDialog = ({ isOpen, onClose }) => {

    const userRef = useRef();
    const errRef = useRef();
    const dialogRef = useRef();

    // State variables for email input and messages
    const [email, setEmail] = useState('');

    const [errMsg, setErrMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
            userRef.current?.focus();
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen]);

    useEffect(() => {
        setErrMsg('');
    }, [email])

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const user = { email };

        try {
            const response = await fetch('http://localhost:8080/api/v1/forgotpassword/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user),
                credentials: 'include'
            });

            if (response.ok) {
                setSuccessMsg("A verification link has been sent to your email!");

                setEmail('');
                setErrMsg('');
            } else {
                setSuccessMsg('');
                let errorData = null;
                try {
                    errorData = await response.json();
                    console.error("Server error:", errorData);
                    setErrMsg(errorData.message || "Something went wrong");
                } catch (e) {
                    console.error("JSON parsing error:", e);
                    setErrMsg("Server error");
                }
                errRef.current?.focus();
            }
        } catch (err) {
            console.error("Catch block error:", err);
            setErrMsg('No Server Response');
            errRef.current?.focus();
        }
    };

    return (
        <dialog ref={dialogRef} className={`${verifyEmailCSS.dialogNative} dialogOverlay`} onClose={() => setIsOpen(false)}>

            {/* Error messages */}
            <p ref={errRef} className={errMsg ? verifyEmailCSS.errmsg : verifyEmailCSS.offscreen} aria-live="assertive">
                {errMsg}
            </p>

            {/* Success message */}
            {successMsg && (
                <p className={verifyEmailCSS.successmsg} aria-live="polite">
                    {successMsg}
                </p>
            )}

            {/* Form for changing email */}
            <h1>Verify your email</h1>

            <form onSubmit={handleSubmit}>

                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    ref={userRef}
                    autoComplete="off"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required
                />

                {/* Submit or cancel button */}
                <div className={verifyEmailCSS.buttonGroup}>
                    <button type="submit" className={verifyEmailCSS.verify}>Verify</button>
                    <button type="button" onClick={onClose} className={verifyEmailCSS.cancel}>Cancel</button>
                </div>

            </form>

            {/* Link to sign up */}
            <p className={verifyEmailCSS.line}>
                <span className={verifyEmailCSS.promptText}>Need an Account?</span>{' '}
                <a href='/register' className={verifyEmailCSS.signUpLink}>Sign Up</a>
            </p>
        </dialog>
    )
}

export default VerifyEmailDialog
