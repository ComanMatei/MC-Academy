import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { useInstrument } from "../context/InstrumentContext";

import { createImages } from "../service/FileService";

const ProfileComponent = () => {

    const navigate = useNavigate();

    // User id
    const { id } = useParams();
    const [user, setUser] = useState({});
    const [validator, setValidator] = useState('');

    const { instrument } = useInstrument();

    const [instructorSpec, setInstructorSpec] = useState('');
    const [assignStudent, setAssignedStudent] = useState('');

    const [isOwnProfile, setIsOwnProfile] = useState(false);

    const [imagePreview, setImagePreview] = useState('');
    const [profilePicture, setProfilePicture] = useState('');

    useEffect(() => {
        const authData = localStorage.getItem("auth");
        const parsedAuth = authData ? JSON.parse(authData) : null;
        const validatorEmail = parsedAuth?.email || null;

        findValidator(validatorEmail);
        getUser();
    }, []);

    useEffect(() => {
        if (validator && id) {
            if (validator.id == id) {
                setIsOwnProfile(true);
            }
        }
    }, [validator, id]);

    useEffect(() => {
        if (validator && instrument) {
            getInstructorSpec(validator.id, instrument);
        }
    }, [validator, instrument]);

    useEffect(() => {
        if (user && instructorSpec) {
            getAssignStudent(user, instructorSpec);
        }
    }, [user, instructorSpec]);

    const handleValidation = async (answer) => {
        if (!validator.role) return;

        let endpoint = "";
        let bodyData = {};
        const validatorId = validator.id;
        const assignStudentId = assignStudent.id;

        // If validator is instructor, he can only validate instructors account
        if (validator.role === "ADMIN") {
            endpoint = `http://localhost:8080/api/v1/admin/validation/${validatorId}/${id}`;
            bodyData = { validatorId, id, answer };
        }

        // If validator is instructor, he can only validate assigning students instruments
        if (validator.role === "INSTRUCTOR") {
            endpoint = `http://localhost:8080/api/v1/instructor/validation/${validatorId}/${assignStudentId}`;
            bodyData = { answer };
        }

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
                withCredentials: true
            });

            if (response.ok) {
                console.log(await response.json());
                getUser();
            } else {
                console.error("Eroare:", response.status);
            }
        } catch (err) {
            console.error("Eroare la fetch:", err);
        }
    };

    const getInstructorSpec = async (validatorId, instrument) => {
        console.log("Inainte de validate: " + validatorId + "   " + instrument);
        try {
            const response = await fetch(`http://localhost:8080/api/v1/instructor/spec/${validatorId}/${instrument}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Spec: " + data.id);

                setInstructorSpec(data);
            } else {
                console.error('Error:', response.status);
            }
        } catch (err) {
            console.error("Eroare:", err);
        }
    }

    const getAssignStudent = async (user, instructorSpec) => {
        const userId = user.id;
        const instructorSpecId = instructorSpec.id;
        console.log("Inainte de validate: " + userId + "   " + instructorSpecId);
        try {
            const response = await fetch(`http://localhost:8080/api/v1/student/assign/${userId}/${instructorSpecId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.ok) {
                const data = await response.json();
                console.log("assign: " + data.id);

                setAssignedStudent(data);
            } else {
                console.error('Error:', response.status);
            }
        } catch (err) {
            console.error("Eroare:", err);
        }
    }

    const getUser = async () => {

        console.log("user id:" + id)

        try {
            const response = await fetch(`http://localhost:8080/api/v1/user/id/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
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
            console.error("Eroare:", err);
        }
    }

    const findValidator = async (email) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/user/email/${email}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Validator Data:", data);
            setValidator(data);

        } catch (err) {
            console.error("Eroare la fetch:", err);
        }
    };

    const updateUser = async () => {
        let updatedUser = { ...user };

        if (profilePicture) {
            try {
                const uploadedImages = await createImages([profilePicture]);
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

        console.log("Utilizator actualizat:", updatedUser);

        try {
            const response = await fetch(`http://localhost:8080/api/v1/user/edit/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
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
            console.error("Eroare:", err);
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
        console.log("file: "+ file)
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
            <h2>Profil utilizator</h2>
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
                    <label htmlFor="role"><strong>Rol:</strong></label>
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

            {(validator.role === "ADMIN" || validator.role === "INSTRUCTOR") && !isOwnProfile && (
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