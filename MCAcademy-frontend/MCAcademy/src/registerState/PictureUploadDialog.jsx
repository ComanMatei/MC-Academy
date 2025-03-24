import { useEffect, useState } from "react";

const PictureUploadDialog = ({
    isOpen,
    onClose,
    createImages,
    profilePicture,
    setProfilePicture,
}) => {
    const [selectedFile, setSelectedFile] = useState(profilePicture);

    useEffect(() => {
        setSelectedFile(profilePicture);
    }, [profilePicture]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        setProfilePicture(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Please select a file first!");
            return;
        }
        await createImages(selectedFile);
        onClose();
    };

    return (
        <div className="dialog-content">
            <button onClick={onClose} className="close-btn">X</button>

            <div className="upload-section">
                <h3>Previzualizare Imagine</h3>
                {selectedFile ? (
                    <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Profile Preview"
                        style={{ width: "200px", height: "200px" }}
                    />
                ) : (
                    <p>No image selected</p>
                )}
            </div>

            <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
            />
            <button
                type="button"
                onClick={() => document.querySelector("input[type='file']").click()}
                className="upload-btn"
            >
                Select Image
            </button>

            <button onClick={handleUpload} className="upload-btn">
                Confirm Upload
            </button>
        </div>
    );
};

export default PictureUploadDialog;
