import './see_course.css';
import SpotifySearch from '../spotifyTrack/SpotifySearch';

import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { createImages } from "../service/FileService";
import { createVideos } from "../service/FileService";
import { saveTrack } from '../service/SpotifyTrackService';
import { getCourse } from '../service/UserService';
import Metronome from '../metronome/Metronome';

import AuthContext from "../context/AuthProvider";

const SeeCourseComponent = () => {

    const { auth } = useContext(AuthContext);
    const token = auth?.accessToken;
    const userRole = auth?.roles;
    const userId = auth?.userId;

    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [spotifyTrack, setSpotifyTrack] = useState(null);

    const [imagesPreview, setImagesPreview] = useState([]);
    const [images, setImages] = useState([]);

    const [videosPreview, setVideosPreview] = useState([]);
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        const fetchCourse = async () => {
            const data = await getCourse(userId, id, token);

            setCourse(data);
        }

        fetchCourse();
    }, [id])

    const getSpotifyId = (url) => {
        if (!url) return null;
        const match = url.match(/track\/([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
    };

    const updateCourse = async () => {
        try {
            let updatedCourse = { ...course };

            if (images && images.length > 0) {
                console.log("images: ", images);
                console.log("imagesPreview: ", imagesPreview);

                const validImages = images.filter(img => img !== undefined);
                const uploadedImages = await createImages(validImages, token);

                updatedCourse = {
                    ...updatedCourse,
                    images: [...updatedCourse.images, ...uploadedImages],
                };
            } else {
                console.log("No images to upload.");
            }

            if (videos && videos.length > 0) {
                console.log("images: ", videos);
                console.log("imagesPreview: ", videosPreview);

                const validVideos = videos.filter(video => video !== undefined);
                const uploadedVideos = await createVideos(validVideos, token);

                updatedCourse = {
                    ...updatedCourse,
                    videos: [...updatedCourse.videos, ...uploadedVideos],
                };
            } else {
                console.log("No videos to upload.");
            }

            if (spotifyTrack) {
                const savedTrack = await saveTrack(spotifyTrack);
                updatedCourse = { ...updatedCourse, spotifyTrack: savedTrack };
            }

            console.log("Updated data:", updatedCourse);

            const response = await fetch(`http://localhost:8080/api/v1/course/${userId}/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedCourse),
                withCredentials: true
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Updated course:", data);
            } else {
                throw new Error('Error updating course');
            }
        } catch (err) {
            console.error("Error updating course", err);
        }
    };

    const handleEditClick = () => {
        setIsEditing(!isEditing);
        setImages([]);
        setImagesPreview([]);
        setVideos([]);
        setVideosPreview([]);
    };

    const handleInputChange = (e) => {
        setCourse({
            ...course,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = () => {
        setIsEditing(false);
        updateCourse();
    };

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleFileChange = async (event, type) => {
        const selectedFiles = Array.from(event.target.files);
        console.log("selectedFiles:", selectedFiles);

        if (selectedFiles.length === 0) {
            console.log("No file has been selected!");
            return;
        }

        if (type === "image") {
            const imagePreviews = selectedFiles.map(file => {
                return {
                    file: file,
                    fileData: URL.createObjectURL(file)
                };
            });
            setImages(prevImages => [...prevImages, ...selectedFiles]);
            setImagesPreview(prevPreviews => [...prevPreviews, ...imagePreviews]);
        }
        if (type === "video") {
            const videoPreviews = selectedFiles.map(file => {
                return {
                    file: file,
                    fileData: URL.createObjectURL(file)
                };
            });
            setVideos(prevVideos => [...prevVideos, ...selectedFiles]);
            setVideosPreview(prevPreviews => [...prevPreviews, ...videoPreviews]);
        }
    };

    const handleSaveTrack = (track) => {
        const newSpotifyTrack = {
            name: track.name,
            artist: track.artists[0].name,
            spotifyUrl: track.external_urls.spotify,
            spotifyId: track.id,
        };

        setSpotifyTrack(track);

        setCourse((prevCourse) => ({
            ...prevCourse,
            spotifyTrack: newSpotifyTrack,
        }));

        setDialogOpen(false);
    };

    const getBack = () => {
        navigate(-1);
    }

    const deleteFileFromCourse = async (fileId, id) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/file/delete/${fileId}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });

            if (response.ok) {
                console.log("Fișier șters cu succes");

                setCourse(prevCourse => {
                    const updatedImages = prevCourse.images.filter(image => image.id !== fileId);
                    const updatedVideos = prevCourse.videos.filter(video => video.id !== fileId);

                    return {
                        ...prevCourse,
                        images: [...updatedImages],
                        videos: [...updatedVideos]
                    };
                });

            } else {
                throw new Error('Error deleting file');
            }
        } catch (err) {
            console.error("Error deleting file", err);
        }
    };

    const handleDeleteImage = (index, isPreview = false) => {
        if (isPreview) {
            const updatedImagesPreview = imagesPreview.filter((_, i) => i !== index);
            const updatedImages = images.filter((_, i) => i !== index);

            setImagesPreview(updatedImagesPreview);
            setImages(updatedImages);
        }
        else {
            const imageToDelete = course.images[index];

            if (imageToDelete?.id) {
                deleteFileFromCourse(imageToDelete.id, id);
            }
            const updatedImages = course.images.filter((_, i) => i !== index);
            setCourse((prevCourse) => ({
                ...prevCourse,
                images: updatedImages
            }));
        }
    };

    const handleDeleteVideo = (index, isPreview = false) => {
        if (isPreview) {
            const updatedVideosPreview = videosPreview.filter((_, i) => i !== index);
            const updatedVideos = videos.filter((_, i) => i !== index);

            setVideos(updatedVideosPreview);
            setVideosPreview(updatedVideos);
        }
        else {
            const videoToDelete = course.videos[index];

            if (videoToDelete?.id) {
                deleteFileFromCourse(videoToDelete.id, id);
            }
            const updatedVideos = course.videos.filter((_, i) => i !== index);
            setCourse((prevCourse) => ({
                ...prevCourse,
                videos: updatedVideos
            }));
        }
    };

    return (
        <div className="p-4 border rounded-lg shadow-md">
            <h2 className="text-xl font-bold">
                {isEditing ? (
                    <input
                        type="text"
                        name="name"
                        value={course?.name || ''}
                        onChange={handleInputChange}
                        className="border p-2 rounded"
                    />
                ) : (
                    course?.name
                )}
            </h2>

            <p>
                <strong>Start Date:</strong>
                {isEditing ? (
                    <input
                        type="date"
                        name="startDate"
                        value={course?.startDate || ''}
                        onChange={handleInputChange}
                        className="border p-2 rounded"
                    />
                ) : (
                    course?.startDate
                )}
            </p>

            <p>
                <strong>End Date:</strong>
                {isEditing ? (
                    <input
                        type="date"
                        name="endDate"
                        value={course?.endDate || ''}
                        onChange={handleInputChange}
                        className="border p-2 rounded"
                    />
                ) : (
                    course?.endDate
                )}
            </p>

            {/* Spotify Track */}
            <h3 className="mt-4 font-semibold">Spotify Track:</h3>
            {course?.spotifyTrack ? (
                <div className="mt-2 p-4 border rounded-lg shadow-md">
                    <p className="text-lg font-medium">
                        {isEditing ? (
                            <input
                                type="text"
                                name="spotifyTrackName"
                                value={course?.spotifyTrack?.name || ''}
                                onChange={handleInputChange}
                                className="border p-2 rounded"
                                onClick={handleOpenDialog}
                            />
                        ) : (
                            `${course.spotifyTrack.name} - ${course.spotifyTrack.artist}`
                        )}
                    </p>

                    <iframe
                        src={`https://open.spotify.com/embed/track/${getSpotifyId(course?.spotifyTrack?.spotifyUrl)}`}
                        width="15%"
                        height="80"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        className="rounded-lg my-2"
                    ></iframe>

                    <a
                        href={course.spotifyTrack.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline block mt-2"
                    >
                        Open in Spotify
                    </a>
                </div>
            ) : (
                <p className="text-gray-500">No track assigned.</p>
            )}

            {/* Add dialog for Spotify track selection */}
            {dialogOpen && (
                <SpotifySearch
                    openDialog={dialogOpen}
                    setOpenDialog={setDialogOpen}
                    setSelectedTrack={handleSaveTrack}
                />
            )}

            {course?.images?.length >= 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold">Images:</h3>

                    {isEditing && (
                        <div className="mt-4">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, "image")}
                            />
                        </div>
                    )}

                    <div className="img-container flex flex-wrap gap-4 mt-4">
                        {Array.isArray(course?.images) &&
                            course.images.map((img, index) => (
                                <div key={index} className="relative flex justify-center items-center">
                                    {isEditing && (
                                        <button onClick={() => handleDeleteImage(index, false)} className="delete-button">
                                            X
                                        </button>
                                    )}
                                    {img?.fileData ? (
                                        <img
                                            src={`data:image/jpeg;base64,${img.fileData}`}
                                            alt={img.name}
                                            className="img-small"
                                        />
                                    ) : (
                                        <div className="no-image-available">
                                            <p>Image not available</p>
                                        </div>
                                    )}
                                </div>
                            ))}

                        {imagesPreview.length > 0 &&
                            imagesPreview.map((preview, index) => (
                                <div key={`preview-${index}`} className="relative flex justify-center items-center">
                                    {isEditing && (
                                        <button onClick={() => handleDeleteImage(index, true)} className="delete-button">
                                            X
                                        </button>
                                    )}
                                    <img src={preview.fileData} alt="Preview" className="img-small" />
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {course?.videos?.length >= 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold">Videos:</h3>
                    {isEditing && (
                        <div className="mt-4">
                            <input type="file" multiple accept="video/*" onChange={(e) => handleFileChange(e, "video")} />
                        </div>
                    )}
                    <div className="video-container">
                        {course.videos.map((video, index) => (
                            <div key={index} className="video-wrapper">
                                {isEditing && (
                                    <button onClick={() => handleDeleteVideo(index, false)} className="delete-button">
                                        X
                                    </button>
                                )}
                                <video controls className="video-small">
                                    <source
                                        src={`data:video/mp4;base64,${video.fileData}`}
                                        type="video/mp4"
                                    />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ))}

                        {/* Show preview videos */}
                        {videosPreview.map((preview, index) => (
                            <div key={`preview-video-${index}`} className="relative flex justify-center items-center">
                                {isEditing && (
                                    <button onClick={() => handleDeleteVideo(index, true)} className="delete-button">
                                        X
                                    </button>
                                )}
                                <video controls className="video-small">
                                    <source
                                        src={preview.fileData}
                                        type="video/mp4"
                                    />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {isEditing && (
                <button onClick={handleSave} className="ml-4 bg-blue-500 text-white p-2 rounded">
                    Save
                </button>
            )}

            {userRole == 'INSTRUCTOR' && (
                <button onClick={handleEditClick}>
                    {isEditing ? "Cancel" : "Edit"}
                </button>
            )}

            {!isEditing && (
                <button onClick={getBack}>
                    Exit
                </button>
            )}

            <Metronome />
        </div>
    );
}

export default SeeCourseComponent;
