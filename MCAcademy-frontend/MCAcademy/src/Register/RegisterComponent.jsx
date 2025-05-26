import { useRef, useState, useEffect } from "react";

import { createprofilePicture } from "../service/FileService";

import registerCSS from './register.module.css'
import RegisterDialog from "./RegisterDialog";

// Regular expressions for validation
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%_]).{8,24}$/;
const NAME_REGEX = /^[A-Z][a-z'-]+(?: [A-Z][a-z'-]+)*$/;
const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const DESCRIPTION_REGEX = /^.{5,254}$/;

const RegisterComponent = () => {
    const userRef = useRef();
    const errRef = useRef();

    // State variables for form fields and validation
    const [firstname, setFirstname] = useState('');
    const [validFirstname, setValidFirstname] = useState(false);

    const [lastname, setLastname] = useState('');
    const [validLastname, setValidLastname] = useState(false);

    const [dateOfBirth, setDateOfBirth] = useState('');
    const [validDateOfBirth, setValidDateOfBirth] = useState(false);

    const [email, setEmail] = useState('');
    const [validEmail, setValidEmail] = useState(false);

    const [description, setDescription] = useState('');
    const [validDescription, setValidDescription] = useState(false);

    const [profilePicturePreview, setProfilePicturePreview] = useState('');
    const [profilePicture, setProfilePicture] = useState('');

    const [password, setPassword] = useState('');
    const [validPassword, setValidPassword] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);

    const [role, setRole] = useState('');
    const [validRole, setValidRole] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);
    const [showDialog, setShowDialog] = useState(false);

    // Error messages for each field
    const [firstnameError, setFirstnameError] = useState('');
    const [lastnameError, setLastnameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [matchPwdError, setMatchPwdError] = useState('');
    const [dateError, setDateError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [profilePictureError, setProfilePictureError] = useState('');
    const [roleError, setRoleError] = useState('');

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
        setErrMsg('');
    }, [firstname, lastname, dateOfBirth, email, password, matchPwd, description])

    const handleRoleSelect = (role) => {
        setValidRole(true);
        setRole(role)
    }

    // Validate date of birth and age based on role
    useEffect(() => {
        const isValidFormat = DATE_REGEX.test(dateOfBirth);
        const age = calculateAge(dateOfBirth);

        let isValidAge = false;
        let ageError = '';

        if (isValidFormat) {
            if (role == 'INSTRUCTOR') {
                isValidAge = age >= 18;
                if (!isValidAge) ageError = 'Instructor must be at least 18 years old.';
            } else if (role == 'STUDENT') {
                isValidAge = age >= 5;
                if (!isValidAge) ageError = 'Student must be at least 5 years old.';
            } else {
                ageError = 'Please select a role.';
            }
        } else if (dateOfBirth) {
            ageError = 'Date must be in format YYYY-MM-DD.';
        }

        setValidDateOfBirth(isValidFormat && isValidAge);
        setDateError(ageError);

    }, [dateOfBirth, role]);

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Validate all fields on change
    useEffect(() => {
        setValidFirstname(NAME_REGEX.test(firstname));
        setFirstnameError(
            firstname && !NAME_REGEX.test(firstname)
                ? "Firstname must start with a capital letter"
                : ''
        );

        setValidLastname(NAME_REGEX.test(lastname));
        setLastnameError(
            lastname && !NAME_REGEX.test(lastname)
                ? "Lastname must start with a capital letter"
                : ''
        );

        setValidEmail(EMAIL_REGEX.test(email));
        setEmailError(
            email && !EMAIL_REGEX.test(email)
                ? "Invalid email format."
                : ''
        );

        setValidDescription(DESCRIPTION_REGEX.test(description));
        setDescriptionError(
            description && !DESCRIPTION_REGEX.test(description)
                ? "Description must have minimum of 100 characters"
                : ''
        );
    }, [firstname, lastname, dateOfBirth, email, description]);

    useEffect(() => {
        const result = PASSWORD_REGEX.test(password);
        setValidPassword(result);
        setPasswordError(
            password && !result
                ? "Password must be 8-24 chars, include uppercase, lowercase, a number, and a special character (!@#$%_)."
                : ''
        );

        const match = password === matchPwd;
        setValidMatch(match);
        setMatchPwdError(
            matchPwd && !match ? "Passwords do not match." : ''
        );
    }, [password, matchPwd]);

    // Handle form inputs submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!profilePicture) {
            setProfilePictureError("Profile picture is required.");
        } else {
            setProfilePictureError('');
        }

        if (!role) {
            setRoleError("Please select your role.");
        } else {
            setRoleError('');
        }

        const picture = await createprofilePicture([profilePicture]);

        const user = { firstname, lastname, dateOfBirth, email, password, role, description, profilePicture: picture[0] }
        setSuccess(true);

        try {
            const response = await fetch('http://localhost:8080/api/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
                withCredentials: true,
            });

            if (response.ok) {
                const data = await response.json();
                setSuccess(true);

                setFirstname('');
                setLastname('');
                setDateOfBirth('');
                setEmail('');
                setPassword('');
                setMatchPwd('');
                setDescription('');

                setShowDialog(true);
            } else {
                let errorMsg = `Error: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData?.details) {
                        errorMsg = errorData.message;
                    } else if (errorData?.message) {
                        errorMsg = errorData.message;
                    }
                } catch (e) {
                    console.log('Something is wrong', e);
                }
                setErrMsg(errorMsg);
                errRef.current?.focus();
            }
        } catch (err) {
            setErrMsg('No Server Response');
            errRef.current?.focus();
        }
    }

    // Handle image input change
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfilePicturePreview(URL.createObjectURL(file));
            setProfilePicture(file);
        }
    };

    return (
        <div className={registerCSS.wrapper}>
            <section className={registerCSS.section}>

                {/* Error messages */}
                <p ref={errRef} className={errMsg ? registerCSS.errmsg : registerCSS.offscreen} aria-live="assertive">
                    {errMsg}
                </p>

                <h1 className={registerCSS.title}>Register</h1>

                {/* Profile picture */}
                {profilePicturePreview && (
                    <img
                        src={profilePicturePreview}
                        alt="Profile Preview"
                        className={registerCSS.profilePreview}
                    />
                )}

                <label htmlFor="file" className={registerCSS.customFileButton}>Select picture</label>
                <input
                    type="file"
                    id="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={registerCSS.fileInput}
                />
                {profilePictureError && <p className={registerCSS.inputError}>{profilePictureError}</p>}

                {/* Choose role btns */}
                <div className={registerCSS.roleButtons}>
                    <p>Choose what role you wanna be</p>
                    <div className={registerCSS.buttonGroup}>
                        <button
                            className={`${registerCSS.instructor} ${role == "INSTRUCTOR" ? registerCSS.active : ""}`}
                            onClick={() => handleRoleSelect("INSTRUCTOR")}
                        >
                            Instructor
                        </button>
                        <button
                            className={`${registerCSS.student} ${role == "STUDENT" ? registerCSS.active : ""}`}
                            onClick={() => handleRoleSelect("STUDENT")}
                        >
                            Student
                        </button>
                        {roleError && <p className={registerCSS.inputRoleError}>{roleError}</p>}
                    </div>
                </div>

                {/* User info */}
                <form onSubmit={handleSubmit} className={registerCSS.form}>

                    <div className={registerCSS.nameDobRow}>
                        <div className={registerCSS.formGroup}>
                            <input
                                type="text"
                                id="firstname"
                                placeholder="Firstname"
                                className={registerCSS.formField}
                                onChange={(e) => setFirstname(e.target.value)}
                                value={firstname}
                                required
                                aria-invalid={validFirstname ? "false" : "true"}
                            />
                            {firstnameError && <p className={registerCSS.inputtError}>{firstnameError}</p>}
                            <label htmlFor="firstname" className={registerCSS.formLabel}>Firstname</label>
                        </div>

                        <div className={registerCSS.formGroup}>
                            <input
                                type="text"
                                id="lastname"
                                placeholder="Lastname"
                                className={registerCSS.formField}
                                onChange={(e) => setLastname(e.target.value)}
                                value={lastname}
                                required
                                aria-invalid={validLastname ? "false" : "true"}
                            />
                            {lastnameError && <p className={registerCSS.inputtError}>{lastnameError}</p>}
                            <label htmlFor="lastname" className={registerCSS.formLabel}>Lastname</label>
                        </div>

                        <div className={registerCSS.formGroup}>
                            <input
                                type="date"
                                id="dateOfBirth"
                                placeholder="Date of birth"
                                className={registerCSS.formDate}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                value={dateOfBirth}
                                required
                                aria-invalid={validDateOfBirth ? "false" : "true"}
                            />
                            {dateError && <p className={registerCSS.inputtError}>{dateError}</p>}
                            <label htmlFor="dateOfBirth" className={registerCSS.formLabel}>Date of birth</label>
                        </div>
                    </div>

                    <div className={registerCSS.twoColumn}>
                        <div className={registerCSS.leftColumn}>
                            <label htmlFor="description" className={registerCSS.descriptionLabel}>Description:</label>
                            <textarea
                                placeholder="Describe yourself..."
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                className={registerCSS.descriptionArea}
                                aria-invalid={validEmail ? "false" : "true"}
                            >
                            </textarea>
                            {descriptionError && <p className={registerCSS.inputttError}>{descriptionError}</p>}
                        </div>

                        <div className={registerCSS.rightColumn}>
                            <div className={registerCSS.formGroup}>
                                <input
                                    type="text"
                                    id="email"
                                    placeholder="Email"
                                    className={registerCSS.formField}
                                    ref={userRef}
                                    value={email}
                                    autoComplete="off"
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    aria-invalid={validEmail ? "false" : "true"}
                                />
                                {emailError && <p className={registerCSS.inputError}>{emailError}</p>}
                                <label htmlFor="email" className={registerCSS.formLabel}>Email</label>
                            </div>

                            <div className={registerCSS.formGroup}>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Password"
                                    className={registerCSS.formField}
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    required
                                    aria-invalid={validPassword ? "false" : "true"}
                                />
                                {passwordError && <p className={registerCSS.inputError}>{passwordError}</p>}
                                <label htmlFor="password" className={registerCSS.formLabel}>Password</label>
                            </div>

                            <div className={registerCSS.formGroup}>
                                <input
                                    type="password"
                                    id="confirm_pwd"
                                    placeholder="Confirm Password"
                                    className={registerCSS.formField}
                                    onChange={(e) => setMatchPwd(e.target.value)}
                                    value={matchPwd}
                                    required
                                    aria-invalid={validMatch ? "false" : "true"}
                                />
                                {matchPwdError && <p className={registerCSS.inputError}>{matchPwdError}</p>}
                                <label htmlFor="confirm_pwd" className={registerCSS.formLabel}>Confirm Password</label>
                            </div>
                        </div>
                    </div>

                    {/* Sign up btn */}
                    <button disabled={!validFirstname || !validLastname || !validDateOfBirth ||
                        !validDescription || !validPassword || !validMatch ? true : false} className={registerCSS.submitButton}>Sign Up</button>
                </form>

                <RegisterDialog isOpen={showDialog} onClose={() => setShowDialog(false)} />

                {/* Navigate to Log in */}
                <p className={registerCSS.loginPrompt}>
                    Already registered? <a href="/login" className={registerCSS.link}>Sign In</a>
                </p>

            </section>
        </div >
    )
}

export default RegisterComponent