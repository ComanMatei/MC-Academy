import { useState, useEffect } from "react";
import { useSearchParams, useNavigate  } from 'react-router-dom';
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%_]).{8,24}$/;

const ChangePasswordComponent = () => {
    const [newPassword, setNewPassword] = useState('');
    const [validNewPassword, setValidNewPassword] = useState(false);
    const [newPasswordFocus, setNewPasswordFocus] = useState(false);

    const [repetPassword, setRepeatPassword] = useState('');
    const [validRepetPassword, setValidRepetPassword] = useState(false);
    const [repetPasswordFocus, setRepetPasswordFocus] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [searchParams] = useSearchParams();

    const confirmToken = searchParams.get("token");

    const navigator = useNavigate();

    useEffect(() => {
        const result = PASSWORD_REGEX.test(newPassword);
        console.log(result);
        console.log(newPassword);
        setValidNewPassword(result);
        const match = newPassword === repetPassword;
        setValidRepetPassword(match);
    }, [newPassword, repetPassword])

    useEffect(() => {
        setErrMsg('');
    }, [newPassword, repetPassword])

    useEffect(() => {
        console.log(confirmToken);
    }, [confirmToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const verify = PASSWORD_REGEX.test(newPassword);
        if (!verify) {
            setErrMsg("Invalid Entry");
            return;
        }
        const password = {newPassword, repetPassword}
        console.log(password);
        console.log("ConfirmToken:", confirmToken);

        try {
            const response = await fetch(`http://localhost:8080/api/v1/forgotpassword/reset?token=${confirmToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify(password),
                withCredentials: true
            })

            console.log("A ajuns pana aici!")
            
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
        <section>
            <h1>Change your password</h1>
            <form onSubmit={handleSubmit}>

                <label htmlFor="password">
                    Password:
                    <FontAwesomeIcon icon={faCheck} className={validNewPassword ? "valid" : "hide"} />
                    <FontAwesomeIcon icon={faTimes} className={validNewPassword || !newPassword ? "hide" : "invalid"} />
                </label>
                <input
                    type="password"
                    id="password"
                    onChange={(e) => setNewPassword(e.target.value)}
                    value={newPassword}
                    required
                    aria-invalid={validNewPassword ? "false" : "true"}
                    aria-describedby="pwdnote"
                    onFocus={() => setNewPasswordFocus(true)}
                    onBlur={() => setNewPasswordFocus(false)}
                />
                <p id="pwdnote" className={newPasswordFocus && !validNewPassword ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    8 to 24 characters. <br />
                    Must include uppercase and lowercase letters, a number and a special character. <br />
                    Allowed special characters:
                    <span aria-label="exclamation mark">!</span> <span aria-label="percent">%</span>
                    <span aria-label="eat symbol">@</span> <span aria-label="hashtag">#</span>
                    <span aria-label="dolar sign">$</span> <span aria-label="underscore">_</span>
                </p>

                <label htmlFor="confirm_pwd">
                    Confirm Password:
                    <FontAwesomeIcon icon={faCheck} className={validRepetPassword && repetPassword ? "valid" : "hide"} />
                    <FontAwesomeIcon icon={faTimes} className={validRepetPassword || !repetPassword ? "hide" : "invalid"} />
                </label>
                <input
                    type="password"
                    id="confirm_pwd"
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    value={repetPassword}
                    required
                    aria-invalid={validRepetPassword ? "false" : "true"}
                    aria-describedby="confirmnote"
                    onFocus={() => setRepetPasswordFocus(true)}
                    onBlur={() => setRepetPasswordFocus(false)}
                />
                <p id="confirmnote" className={repetPasswordFocus && !validRepetPassword ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Must match the first password input field.
                </p>

                <button disabled={!validNewPassword || !validRepetPassword ? true : false}>Change</button>
            </form>
            <p>
                Already registered?<br />
                <span className="line">
                    {/*put router link here*/}
                    <a href="http://localhost:5173/login">Sign In</a>
                </span>
            </p>

        </section>
    )
}

export default ChangePasswordComponent