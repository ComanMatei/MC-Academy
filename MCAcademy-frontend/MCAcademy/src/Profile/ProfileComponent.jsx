import { useRef, useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { getUsersValidatorById } from "../service/UserService";
import { createImages } from "../service/FileService";
import { getUserById } from "../service/UserService";
import { usersValidation } from "../service/AdminService";

import AuthContext from "../context/AuthProvider";

import ProfileCSS from './profile.module.css';
import { FiUpload } from "react-icons/fi";

// Inputs validation
const NAME_REGEX = /^[A-Z][a-z'-]+(?: [A-Z][a-z'-]+)*$/;
const DESCRIPTION_REGEX = /^[\s\S]{5,254}$/;

const ProfileComponent = () => {

    const { auth } = useContext(AuthContext);
    const token = auth?.accessToken;
    const validatorUserId = auth?.userId;
    const role = auth?.roles;

    const navigate = useNavigate();

    // User id
    const { id } = useParams();
    const errRef = useRef();

    const [user, setUser] = useState({});
    const [validator, setValidator] = useState('');

    const [isOwnProfile, setIsOwnProfile] = useState(false);

    const [imagePreview, setImagePreview] = useState('');
    const [profilePicture, setProfilePicture] = useState('');

    // Error/Succes validation fields
    const [errMsg, setErrMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [validFirstname, setValidFirstname] = useState(false);
    const [validLastname, setValidLastname] = useState(false);
    const [validDescription, setValidDescription] = useState(false);

    const [firstnameError, setFirstnameError] = useState('');
    const [lastnameError, setLastnameError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [statusError, setStatusError] = useState('');

    // Testing fields with custom errors
    useEffect(() => {
        const firstname = user.firstname || '';
        const lastname = user.lastname || '';
        const description = user.description || '';

        setValidFirstname(NAME_REGEX.test(firstname));
        setFirstnameError(
            firstname && !NAME_REGEX.test(firstname)
                ? "Must start with a capital letter, only letters"
                : ''
        );

        setValidLastname(NAME_REGEX.test(lastname));
        setLastnameError(
            lastname && !NAME_REGEX.test(lastname)
                ? "Must start with a capital letter, only letters"
                : ''
        );

        setValidDescription(DESCRIPTION_REGEX.test(description));
        setDescriptionError(
            description && !DESCRIPTION_REGEX.test(description)
                ? "Description must have minimum of 5 characters and max 254"
                : ''
        );
    }, [user.firstname, user.lastname, user.description]);

    useEffect(() => {
        const fetchValidator = async () => {
            if (!validatorUserId || !token) return;

            if (role == "ADMIN") {
                const validator = await getUsersValidatorById(validatorUserId, token);
                setValidator(validator);
            }
        };

        fetchValidator();
    }, [id, token]);

    // Return user found by URL id
    useEffect(() => {
        const fetchUser = async () => {
            const user = await getUserById(id, token);
            setUser(user);
        };

        fetchUser();
    }, [id, token]);

    // Sets if the user acces his own profile or not
    useEffect(() => {
        if (!validator) {
            setIsOwnProfile(true);
        } else if (validator.id == id) {
            setIsOwnProfile(true);
        } else {
            setIsOwnProfile(false);
        }
    }, [validator, id]);

    // If admin acces user profile for validation
    const handleValidation = async (answer) => {
        if (!validator.role) return;

        const validatorId = validator.id;

        try {
            await usersValidation(validatorId, id, answer, token);
            const updatedUser = await getUserById(id, token);
            setUser(updatedUser);
            
            setStatusError('')
        } catch (error) {
            const errorMessage = error?.message || 'Validation failed';
            setStatusError(errorMessage);
        }
    };

    const updateUser = async () => {
        let updatedUser = { ...user };

        if (profilePicture) {
            try {
                const uploadedImages = await createImages([profilePicture], token);
                if (uploadedImages) {
                    updatedUser.profilePicture = uploadedImages[0];
                } else {
                    console.error("Server error");
                    return;
                }
            } catch (error) {
                console.error("Server error", error);
                return;
            }
        }

        try {
            const response = await fetch(`http://localhost:8080/api/v1/user/${id}/edit`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedUser),
                withCredentials: true
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);

                setSuccessMsg("Succesfully updated!");
                setErrMsg("");
            } else {
                setSuccessMsg('');
                let errorData = null;
                try {
                    errorData = await response.json();
                } catch (e) {
                    console.error('Error parsing error response:', e);
                }

                if (response.status == 400) {
                    setErrMsg(errorData?.message || 'Invalid request.');
                }
                errRef.current?.focus();
            }
        } catch (err) {
            console.error("Network error:", err);
            setErrMsg("Server unavailable or network error.");
            errRef.current?.focus();
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        
        if (file) {
            const newImageUrl = URL.createObjectURL(file);

            setProfilePicture(file);
            setImagePreview(newImageUrl);
        }
    };

    const getBack = () => {
        navigate(-1);
    }

    return (
        <div className={ProfileCSS.wrapper}>
            <div className={ProfileCSS.profileContainer}>
                <div className={ProfileCSS.profileCard}>

                    {/* Error messages */}
                    {errMsg && (
                        <p
                            ref={errRef}
                            className={`${ProfileCSS.errmsg} ${ProfileCSS.visible}`}
                            aria-live="assertive"
                        >
                            {errMsg}
                        </p>
                    )}

                    {/* Success message */}
                    {successMsg && (
                        <p className={ProfileCSS.successmsg} aria-live="polite">
                            {successMsg}
                        </p>
                    )}

                    <h2 className={ProfileCSS.title}>My profile</h2>

                    {/* Form with user fields */}
                    <form className={ProfileCSS.form}>
                        <div className={ProfileCSS.imageSection}>
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className={ProfileCSS.profileImage} />
                            ) : user.profilePicture && (
                                <img
                                    src={`data:image/jpeg;base64,${user.profilePicture.fileData}`}
                                    alt="Profile"
                                    className={ProfileCSS.profileImage}
                                />
                            )}

                            {isOwnProfile && (
                                <>
                                    <label htmlFor="file" className={ProfileCSS.uploadWrapper}>
                                        <div className={ProfileCSS.iconBox}>
                                            <FiUpload className={ProfileCSS.icon} />
                                        </div>
                                        <span className={ProfileCSS.uploadText}>Change picture</span>
                                    </label>
                                    <input
                                        type="file"
                                        id="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className={ProfileCSS.fileInput}
                                    />
                                </>
                            )}
                        </div>

                        <div className={ProfileCSS.inlineGroup}>
                            <div className={ProfileCSS.inputGroup}>
                                <label>Firstname</label>
                                <input
                                    type="text"
                                    name="firstname"
                                    value={user.firstname || ""}
                                    onChange={handleInputChange}
                                    readOnly={!isOwnProfile}
                                />
                                {firstnameError && <p className={ProfileCSS.inputError}>{firstnameError}</p>}
                            </div>

                            <div className={ProfileCSS.inputGroup}>
                                <label>Lastname</label>
                                <input
                                    type="text"
                                    name="lastname"
                                    value={user.lastname || ""}
                                    onChange={handleInputChange}
                                    readOnly={!isOwnProfile}
                                />
                                {lastnameError && <p className={ProfileCSS.inputError}>{lastnameError}</p>}
                            </div>

                        </div>

                        <div className={ProfileCSS.inputGroup}>
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={user.email || ""}
                                readOnly
                                className={ProfileCSS.smallInput}
                            />
                        </div>

                        <div className={ProfileCSS.inputGroup}>
                            <label>Date of birth</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={user.dateOfBirth || ""}
                                onChange={handleInputChange}
                                readOnly
                                className={ProfileCSS.smallInput}
                            />
                        </div>

                        <div className={ProfileCSS.inputGroup}>
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={user.description || ""}
                                onChange={handleInputChange}
                                readOnly={!isOwnProfile}
                            />
                        </div>
                        {descriptionError && <p className={ProfileCSS.inputError}>{descriptionError}</p>}

                        <div className={ProfileCSS.inputGroup}>
                            <label>Role</label>
                            <input
                                type="text"
                                name="role"
                                value={user.role || ""}
                                readOnly
                                className={ProfileCSS.smallInput}
                            />
                        </div>

                        {!isOwnProfile && (
                            <div className={ProfileCSS.inputGroup}>
                                <label className={ProfileCSS.status}>User status</label>
                                <input
                                    type="text"
                                    name="status"
                                    value={user.status || ""}
                                    readOnly
                                    className={ProfileCSS.smallInput}
                                />
                                {statusError && <p className={ProfileCSS.inputError}>{statusError}</p>}
                            </div>
                        )}

                    </form>

                    {/* These buttons are only available to admins */}
                    <div className={ProfileCSS.buttonGroup}>
                        {(validator.role == "ADMIN") && !isOwnProfile && (
                            <>
                                <button onClick={() => handleValidation(true)} className={ProfileCSS.approveButton}>
                                    Approve
                                </button>
                                <button onClick={() => handleValidation(false)} className={ProfileCSS.declineButton}>
                                    Decline
                                </button>
                            </>
                        )}

                        {/* Update profile */}
                        {isOwnProfile && (
                            <button
                                onClick={updateUser}
                                className={ProfileCSS.saveButton}
                                disabled={
                                    !validFirstname || !validLastname || !validDescription
                                }
                            >
                                Save changes
                            </button>
                        )}

                        <button onClick={getBack} className={ProfileCSS.backButton}>
                            Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );


}

export default ProfileComponent;