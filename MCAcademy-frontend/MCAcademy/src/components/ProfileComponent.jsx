import { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { getUsersValidatorById } from "../service/UserService";
import { createImages } from "../service/FileService";
import { getUserById } from "../service/UserService";
import { usersValidation } from "../service/AdminService";

import AuthContext from "../context/AuthProvider";

const ProfileComponent = () => {

    const { auth } = useContext(AuthContext);
    const token = auth?.accessToken;
    const validatorUserId = auth?.userId;
    const role = auth?.roles;

    const navigate = useNavigate();

    // User id
    const { id } = useParams();
    const [user, setUser] = useState({});
    const [validator, setValidator] = useState('');

    const [instructorSpecId, setInstructorSpecId] = useState('');
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    const [imagePreview, setImagePreview] = useState('');
    const [profilePicture, setProfilePicture] = useState('');

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

    useEffect(() => {
        const fetchUser = async () => {
            const user = await getUserById(id, token);
            setUser(user);
        };

        fetchUser();
    }, []);

    useEffect(() => {
        if (role == "INSTRUCTOR" || role == "STUDENT") {
            if (id != validatorUserId) {
                navigate("/url-unauthorized");
                return;
            }
        }
    }, [id, validatorUserId, navigate]);

    useEffect(() => {
        if (!validator) {
            setIsOwnProfile(true);
        } else if (validator.id === id) {
            setIsOwnProfile(true);
        } else {
            setIsOwnProfile(false);
        }
    }, [validator, id]);

    const handleValidation = async (answer) => {
        if (!validator.role) return;

        const validatorId = validator.id;

        await usersValidation(validatorId, id, answer, token);

        const updatedUser = await getUserById(id, token);
        setUser(updatedUser);
    };

    const updateUser = async () => {
        let updatedUser = { ...user };

        if (profilePicture) {
            try {
                const uploadedImages = await createImages([profilePicture], token);
                if (uploadedImages) {
                    updatedUser.profilePicture = uploadedImages[0];
                } else {
                    console.error("Eroare la încărcarea imaginii.");
                    return;
                }
            } catch (error) {
                console.error("Eroare la încărcarea imaginii:", error);
                return;
            }
        }

        try {
            const response = await fetch(`http://localhost:8080/api/v1/user/edit/${id}`, {
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
                console.log(data);

                setUser(data);
            } else {
                console.error('Error:', response.status);
            }
        } catch (err) {
            console.error("Erorr:", err);
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
        console.log("file: " + file)
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
        <div>
            <h2>User profile</h2>
            <form>
                <div>
                    {imagePreview ? (
                        <div>
                            <img
                                src={imagePreview}
                                alt="Profile"
                                style={{ width: "150px", height: "150px", borderRadius: "50%" }}
                            />
                        </div>
                    ) : (
                        user.profilePicture && (
                            <div>
                                <img
                                    src={`data:image/jpeg;base64,${user.profilePicture.fileData}`}
                                    alt="Profile"
                                    style={{ width: "150px", height: "150px", borderRadius: "50%" }}
                                />
                            </div>
                        )
                    )}
                    {isOwnProfile && (
                        <div>
                            <label htmlFor="profilePicture">Schimbă imaginea de profil:</label>
                            <input
                                type="file"
                                id="profilePicture"
                                name="profilePicture"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="firstname"><strong>Nume:</strong></label>
                    <input
                        type="text"
                        id="firstname"
                        name="firstname"
                        value={user.firstname || ""}
                        onChange={handleInputChange}
                        readOnly={!isOwnProfile}
                    />
                </div>
                <div>
                    <label htmlFor="lastname"><strong>Prenume:</strong></label>
                    <input
                        type="text"
                        id="lastname"
                        name="lastname"
                        value={user.lastname || ""}
                        onChange={handleInputChange}
                        readOnly={!isOwnProfile}
                    />
                </div>
                <div>
                    <label htmlFor="email"><strong>Email:</strong></label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={user.email || ""}
                        onChange={handleInputChange}
                        readOnly
                    />
                </div>
                <div>
                    <label htmlFor="dateOfBirth"><strong>Data nașterii:</strong></label>
                    <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={user.dateOfBirth || ""}
                        onChange={handleInputChange}
                        readOnly={!isOwnProfile}
                    />
                </div>
                <div>
                    <label htmlFor="description"><strong>Descriere:</strong></label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={user.description || ""}
                        onChange={handleInputChange}
                        readOnly={!isOwnProfile}
                    />
                </div>
                <div>
                    <label htmlFor="role"><strong>Role:</strong></label>
                    <input
                        type="text"
                        id="role"
                        name="role"
                        value={user.role || ""}
                        onChange={handleInputChange}
                        readOnly
                    />
                </div>
                <div>
                    <label htmlFor="status"><strong>Stare cont:</strong></label>
                    <input
                        type="text"
                        id="status"
                        name="status"
                        value={user.status || ""}
                        onChange={handleInputChange}
                        readOnly
                    />
                </div>
            </form>
            {/*<p><strong>Assign</strong> {instrument} <strong>course status :</strong> {assignStudent.status}</p>*/}

            {(validator.role == "ADMIN") && !isOwnProfile && (
                <>
                    <button onClick={() => handleValidation(false)}>
                        Lock
                    </button>
                    <button onClick={() => handleValidation(true)}>
                        Unlock
                    </button>
                </>
            )}

            {isOwnProfile && (
                <button onClick={updateUser}>
                    Save changes
                </button>
            )}
            <button onClick={getBack}>
                Back
            </button>

        </div>
    );

}

export default ProfileComponent;