import { useRef, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import '../registerState/register.css'
import PictureUploadDialog from "./PictureUploadDialog";

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%_]).{8,24}$/;
const NAME_REGEX = /^[A-Z][a-z'-]+(?: [A-Z][a-z'-]+)*$/;
const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const DESCRIPTION_REGEX = /^.{1,254}$/;

const RegisterComponent = () => {
    const userRef = useRef();
    const errRef = useRef();
    const navigate = useNavigate();

    const [firstname, setFirstname] = useState('');
    const [validFirstname, setValidFirstname] = useState(false);
    const [firstnameFocus, setFirstnameFocus] = useState(false);

    const [lastname, setLastname] = useState('');
    const [validLastname, setValidLastname] = useState(false);
    const [lastnameFocus, setLastnameFocus] = useState(false);

    const [dateOfBirth, setDateOfBirth] = useState('');
    const [validDateOfBirth, setValidDateOfBirth] = useState(false);
    const [dateOfBirthFocus, setDateOfBirthFocus] = useState(false);

    const [email, setEmail] = useState('');
    const [validEmail, setValidEmail] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false);

    const [description, setDescription] = useState('');
    const [validDescription, setValidDescription] = useState(false);
    const [descriptionFocus, setDescriptionFocus] = useState(false);

    const [profilePicture, setProfilePicture] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [password, setPassword] = useState('');
    const [validPassword, setValidPassword] = useState(false);
    const [passwordFocus, setPasswordFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [role, setRole] = useState('');
    const [validRole, setValidRole] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setValidFirstname(NAME_REGEX.test(firstname));
        setValidLastname(NAME_REGEX.test(lastname));
        setValidDateOfBirth(DATE_REGEX.test(dateOfBirth));
        setValidEmail(EMAIL_REGEX.test(email));
        setValidDescription(DESCRIPTION_REGEX.test(description))
    }, [email, firstname, lastname, dateOfBirth, description])

    useEffect(() => {
        const result = PASSWORD_REGEX.test(password);
        console.log(result);
        console.log(password);
        setValidPassword(result);
        const match = password === matchPwd;
        setValidMatch(match);
    }, [password, matchPwd])

    useEffect(() => {
        setErrMsg('');
    }, [firstname, lastname, dateOfBirth, email, password, matchPwd, description])

    const handleRoleSelect = (role) => {
        setValidRole(true);
        setRole(role)
    }

    const createImages = async () => {
        if (!profilePicture) {
            console.log("No file has been selected!");
            return;
        }

        const formData = new FormData();
        formData.append('file', profilePicture);

        try {
            const response = await fetch('http://localhost:8080/api/v1/file/create-image', {
                method: 'POST',
                body: formData,
                withCredentials: true
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Profile picture:", data);

                setProfilePicture(data);
            } else {
                console.error('Request failed with status:', response.status);
            }
        } catch (error) {
            console.error('Failed to upload files:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const v1 = NAME_REGEX.test(firstname);
        const v2 = NAME_REGEX.test(lastname);
        const v3 = DATE_REGEX.test(dateOfBirth);
        const v4 = EMAIL_REGEX.test(email);
        const v5 = PASSWORD_REGEX.test(password);
        const v6 = DESCRIPTION_REGEX.test(description)
        if (!v1 || !v2 || !v3 || !v4 || !v5 || !v6) {
            setErrMsg("Invalid Entry");
            return;
        }

        const user = { firstname, lastname, dateOfBirth, email, password, role, description, profilePicture: profilePicture[0] }
        console.log(user);
        setSuccess(true);

        try {
            const response = await fetch('http://localhost:8080/api/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user),
                withCredentials: true
            })

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                console.log(data.token);
            } else {
                console.error('Error:', response.status);
            }

            setSuccess(true);

            setFirstname('');
            setLastname('');
            setDateOfBirth('');
            setEmail('');
            setPassword('');
            setMatchPwd('');
            setDescription('');
            setProfilePicture('');

            navigate('/mail-info');
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 409) {
                setErrMsg('Username Taken');
            } else {
                setErrMsg('Registration Failed')
            }
            errRef.current.focus();
        }
    }

    const handleProfilePictureChange = (event) => {
        setProfilePicture(event.target.files[0]);
    };

    const handleOpenDialog = () => {
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    return (
        <section>
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
            <h1>Register</h1>

            <button onClick={() => handleRoleSelect("INSTRUCTOR")}> Instructor </button>
            <button onClick={() => handleRoleSelect("STUDENT")}> Student </button>
            <form onSubmit={handleSubmit}>

                <label htmlFor="firstname">
                    Firstname:
                    <FontAwesomeIcon icon={faCheck} className={validFirstname ? "valid" : "hide"} />
                    <FontAwesomeIcon icon={faTimes} className={!validFirstname && firstname ? "invalid" : "hide"} />
                </label>
                <input
                    type="text"
                    id="firstname"
                    onChange={(e) => setFirstname(e.target.value)}
                    value={firstname}
                    required
                    aria-invalid={validFirstname ? "false" : "true"}
                    aria-describedby="confirmnote"
                    onFocus={() => setFirstnameFocus(true)}
                    onBlur={() => setFirstnameFocus(false)}
                />
                <p id="uidnote" className={firstnameFocus && firstname && !validFirstname ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Uppercase first letter<br />
                </p>

                <label htmlFor="lastname">
                    Lastname:
                    <FontAwesomeIcon icon={faCheck} className={validLastname ? "valid" : "hide"} />
                    <FontAwesomeIcon icon={faTimes} className={!validLastname && lastname ? "invalid" : "hide"} />
                </label>
                <input
                    type="text"
                    id="lastname"
                    onChange={(e) => setLastname(e.target.value)}
                    value={lastname}
                    required
                    aria-invalid={validLastname ? "false" : "true"}
                    aria-describedby="confirmnote"
                    onFocus={() => setLastnameFocus(true)}
                    onBlur={() => setLastnameFocus(false)}
                />
                <p id="uidnote" className={lastnameFocus && lastname && !validLastname ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Uppercase first letter<br />
                </p>

                <label htmlFor="dateOfBirth">
                    Date of birth:
                    <FontAwesomeIcon icon={faCheck} className={validDateOfBirth ? "valid" : "hide"} />
                    <FontAwesomeIcon icon={faTimes} className={!validDateOfBirth && dateOfBirth ? "invalid" : "hide"} />
                </label>
                <input
                    type="date"
                    id="dateOfBirth"
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    value={dateOfBirth}
                    required
                    aria-invalid={validDateOfBirth ? "false" : "true"}
                    aria-describedby="confirmnote"
                    onFocus={() => setDateOfBirthFocus(true)}
                    onBlur={() => setDateOfBirthFocus(false)}
                />
                <p id="uidnote" className={dateOfBirthFocus && dateOfBirth && !validDateOfBirth ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Incorrect date <br />
                </p>

                <label htmlFor="email">Email:
                    <span className={validEmail ? "valid" : "hide"}>
                        <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span className={validEmail || !email ? "hide" : "invalid"}>
                        <FontAwesomeIcon icon={faTimes} />
                    </span>
                </label>
                <input
                    type="text"
                    id="email"
                    ref={userRef}
                    value={email}
                    autoComplete="off"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-invalid={validEmail ? "false" : "true"}
                    aria-describedby="uidnote"
                    onFocus={() => setEmailFocus(true)}
                    onBlur={() => setEmailFocus(false)}
                />
                <p id="uidnote" className={emailFocus && email && !validEmail ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    4 to 24 characters.<br />
                    Must begin with a letter.<br />
                    Letters, numbers, underscores, hyphens allowed.
                </p>

                <label htmlFor="description">Description:
                    <span className={validDescription ? "valid" : "hide"}>
                        <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span className={validDescription || !description ? "hide" : "invalid"}>
                        <FontAwesomeIcon icon={faTimes} />
                    </span>
                </label>
                <textarea
                    placeholder="Describe yourself..."
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    aria-invalid={validEmail ? "false" : "true"}
                    aria-describedby="uidnote"
                    onFocus={() => setDescriptionFocus(true)}
                    onBlur={() => setDescriptionFocus(false)}
                >
                </textarea>
                <p id="uidnote" className={descriptionFocus && description && !validDescription ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Minimum 100 characters
                </p>

                <label htmlFor="profilePicture">Profile Picture:</label>
                <input
                    type="file"
                    id="profilePicture"
                    onChange={handleProfilePictureChange}
                    accept="image/*"
                    style={{ display: "none" }}
                />
                {profilePicture && <p>Profile picture uploaded successfully!</p>}

                <button type="button" onClick={handleOpenDialog}>
                    Open Dialog
                </button>

                {isDialogOpen && (
                    <div className="dialog-overlay" onClick={handleCloseDialog}>
                        <div className="dialog">
                            <h2>Încarcă poza de profil</h2>
                            <PictureUploadDialog
                                isOpen={isDialogOpen}
                                onClose={handleCloseDialog}
                                createImages={createImages}
                                profilePicture={profilePicture}
                                setProfilePicture={setProfilePicture}
                            />
                        </div>
                    </div>
                )}

                <label htmlFor="password">
                    Password:
                    <FontAwesomeIcon icon={faCheck} className={validPassword ? "valid" : "hide"} />
                    <FontAwesomeIcon icon={faTimes} className={validPassword || !password ? "hide" : "invalid"} />
                </label>
                <input
                    type="password"
                    id="password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                    aria-invalid={validPassword ? "false" : "true"}
                    aria-describedby="pwdnote"
                    onFocus={() => setPasswordFocus(true)}
                    onBlur={() => setPasswordFocus(false)}
                />
                <p id="pwdnote" className={passwordFocus && !validPassword ? "instructions" : "offscreen"}>
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
                    <FontAwesomeIcon icon={faCheck} className={validMatch && matchPwd ? "valid" : "hide"} />
                    <FontAwesomeIcon icon={faTimes} className={validMatch || !matchPwd ? "hide" : "invalid"} />
                </label>
                <input
                    type="password"
                    id="confirm_pwd"
                    onChange={(e) => setMatchPwd(e.target.value)}
                    value={matchPwd}
                    required
                    aria-invalid={validMatch ? "false" : "true"}
                    aria-describedby="confirmnote"
                    onFocus={() => setMatchFocus(true)}
                    onBlur={() => setMatchFocus(false)}
                />
                <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Must match the first password input field.
                </p>

                <button disabled={!validFirstname || !validLastname || !validDateOfBirth || !validRole
                    || !validEmail || !validDescription || !validPassword || !validMatch ? true : false}>Sign Up</button>
            </form>
            <p>
                Already registered?<br />
                <span className="line">
                    <a href="http://localhost:5173/login">Sign In</a>
                </span>
            </p>

        </section>
    )
}

export default RegisterComponent