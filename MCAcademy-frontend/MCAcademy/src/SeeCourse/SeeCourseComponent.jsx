import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { createImages } from "../service/FileService";
import { createVideos } from "../service/FileService";
import { getCourse } from '../service/UserService';

import Metronome from '../metronome/Metronome';
import SpotifySearch from '../spotifyTrack/SpotifySearch';
import AuthContext from "../context/AuthProvider";

import SeeCourseCSS from './seeCourse.module.css'
import { FiUpload } from "react-icons/fi";

const SeeCourseComponent = () => {

    const { auth } = useContext(AuthContext);
    const token = auth?.accessToken;
    const userRole = auth?.roles;
    const userId = auth?.userId;

    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [spotifyTrack, setSpotifyTrack] = useState(null);

    const [imagesPreview, setImagesPreview] = useState([]);
    const [images, setImages] = useState([]);
    const [deletingImages, setDeletingImages] = useState([]);

    const [videosPreview, setVideosPreview] = useState([]);
    const [videos, setVideos] = useState([]);
    const [deletingVideos, setDeletingVideos] = useState([]);

    // Custom erros fields
    const [startDateError, setStartDateError] = useState('');
    const [endDateError, setEndDateError] = useState('');
    const [nameError, setNameError] = useState('');

    // Navigate images in full screen mode fiels
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const allImages = [...(course.images || []), ...imagesPreview];
    const selectedImage = selectedImageIndex !== null ? allImages[selectedImageIndex] : null;

    const openFullscreenImages = (index) => {
        setSelectedImageIndex(index);
    };

    const closeFullscreenImage = () => {
        setSelectedImageIndex(null);
    };

    const showNextImage = () => {
        setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const showPrevImage = () => {
        setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    // Navigate videos in full screen mode fiels
    const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);
    const allVideos = [...(course.videos || []), ...videosPreview];
    const selectedVideo = selectedVideoIndex !== null ? allVideos[selectedVideoIndex] : null;

    const openFullscreenVideo = (index) => {
        setSelectedVideoIndex(index);
    };

    const closeFullscreenVideo = () => {
        setSelectedVideoIndex(null);
    };

    const showNextVideo = () => {
        setSelectedVideoIndex((prev) => (prev + 1) % allVideos.length);
    };

    const showPrevVideo = () => {
        setSelectedVideoIndex((prev) => (prev - 1 + allVideos.length) % allVideos.length);
    };

    // Custom errors for dates
    useEffect(() => {
        let startError = '';
        let endError = '';

        if (!course?.startDate) {
            startError = 'Start date is required.';
        }

        if (!course?.endDate) {
            endError = 'End date is required.';
        }

        if (course?.startDate && course?.endDate) {
            const start = new Date(course.startDate);
            const end = new Date(course.endDate);

            if (start > end) {
                startError = 'Start date must be before end date.';
                endError = 'End date must be after start date.';
            }
        }

        setStartDateError(startError);
        setEndDateError(endError);

    }, [course]);

    useEffect(() => {
        const fetchCourse = async () => {
            const data = await getCourse(userId, id, token);

            setCourse(data);
            setSpotifyTrack(data.spotifyTrack || null);
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
            // Delete files which are selected
            for (const image of deletingImages) {
                await deleteFileFromCourse(image.id, id);
            }
            for (const video of deletingVideos) {
                await deleteFileFromCourse(video.id, id);
            }

            // Filter out files marked for deletion
            const filteredImages = (course.images || []).filter(img => !deletingImages.some(d => d.id === img.id));
            const filteredVideos = (course.videos || []).filter(vid => !deletingVideos.some(d => d.id === vid.id));

            // Change course state active to history
            let isHistory = course.isHistory;
            const endDateTimestamp = new Date(course.endDate).getTime();

            if (Date.now() > endDateTimestamp && course.isHistory === false) {
                isHistory = true;
            }
            else {
                isHistory = false;
            }

            // Course object
            let updatedCourse = {
                name: course.name,
                instrument: course.instrument,
                startDate: course.startDate,
                endDate: course.endDate,
                instructorId: course.instructorId,
                spotifyTrack: spotifyTrack ?? course.spotifyTrack,
                images: [...filteredImages],
                videos: [...filteredVideos],
                isHistory: isHistory
            };

            if (images.length > 0) {
                const uploadedImages = await createImages(images, token);
                updatedCourse.images = [...updatedCourse.images, ...uploadedImages];
            }

            if (videos.length > 0) {
                const uploadedVideos = await createVideos(videos, token);
                updatedCourse.videos = [...updatedCourse.videos, ...uploadedVideos];
            }

            if (spotifyTrack) {
                updatedCourse.spotifyTrack = spotifyTrack;
            }

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
                setCourse(updatedCourse);

                setImages([]);
                setImagesPreview([]);

                setVideos([]);
                setVideosPreview([]);

                setDeletingImages([]);
                setDeletingVideos([]);
            } else {
                let errorData = null;
                try {
                    errorData = await response.json();
                } catch (e) {
                    console.error('Something is wrong', e);
                }

                if (response.status == 400) {
                    setNameError(errorData?.message || 'Missing or invalid data');
                }
            }
        } catch (err) {
            console.error("Error updating course", err);
        }
    };

    // Toggle edit mode: reset state on cancel or prepare for editing
    const handleEditClick = async () => {
        if (isEditing) {
            const data = await getCourse(userId, id, token);
            setCourse(data);

            setDeletingImages([]);
            setDeletingVideos([]);

            setImages([]);
            setImagesPreview([]);

            setVideos([]);
            setVideosPreview([]);

            setSpotifyTrack(data.spotifyTrack || null);
        } else {
            setImages([]);
            setImagesPreview([]);

            setVideos([]);
            setVideosPreview([]);
        }

        setIsEditing(!isEditing);
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

    // Rendaring and managering files preview in web page
    const handleFileChange = async (event, type) => {
        const selectedFiles = Array.from(event.target.files);

        if (selectedFiles.length === 0) {
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

    // Add spotify track to course
    const handleSaveTrack = (track) => {

        setSpotifyTrack(track);

        setCourse((prevCourse) => ({
            ...prevCourse,
            spotifyTrack: track,
        }));

        setDialogOpen(false);
    };

    const handleDeleteSpotifyTrack = () => {
        setSpotifyTrack(null);
        setCourse(prevCourse => ({
            ...prevCourse,
            spotifyTrack: null
        }));
    };

    const getBack = () => {
        navigate('/courses');
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

    const handleDeleteImage = (index, isNew) => {
        if (isNew) {
            setImages(prev => prev.filter((_, i) => i !== index));
            setImagesPreview(prev => prev.filter((_, i) => i !== index));
        } else {
            const deleted = course.images[index];
            setCourse(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index)
            }));
            setDeletingImages(prev => [...prev, deleted]);
        }
    };

    const handleDeleteVideo = (index, isNew) => {
        if (isNew) {
            setVideos(prev => prev.filter((_, i) => i !== index));
            setVideosPreview(prev => prev.filter((_, i) => i !== index));
        } else {
            const deleted = course.videos[index];
            setCourse(prev => ({
                ...prev,
                videos: prev.videos.filter((_, i) => i !== index)
            }));
            setDeletingVideos(prev => [...prev, deleted]);
        }
    };

    return (
        <div className={SeeCourseCSS.wrapper}>

            {/* Name field */}
            <h2 className={SeeCourseCSS.title}>
                {isEditing ? (
                    <input
                        type="text"
                        name="name"
                        value={course?.name || ''}
                        onChange={handleInputChange}
                        className={SeeCourseCSS.input}
                    />
                ) : (
                    course?.name
                )}
                {nameError && <p className={SeeCourseCSS.inputError}>{nameError}</p>}
            </h2>

            {/* Date fields */}
            <div className={SeeCourseCSS.dateWrapper}>
                <div className={SeeCourseCSS.dateItem}>
                    <strong>Start Date</strong>
                    {isEditing ? (
                        <input
                            type="date"
                            name="startDate"
                            value={course?.startDate || ''}
                            onChange={handleInputChange}
                            className={SeeCourseCSS.input}
                        />
                    ) : (
                        course?.startDate
                    )}
                    {startDateError && <div className={SeeCourseCSS.dateInputError}>{startDateError}</div>}
                </div>

                <div className={SeeCourseCSS.dateItem}>
                    <strong>End Date</strong>
                    {isEditing ? (
                        <input
                            type="date"
                            name="endDate"
                            value={course?.endDate || ''}
                            onChange={handleInputChange}
                            className={SeeCourseCSS.input}
                        />
                    ) : (
                        course?.endDate
                    )}
                    {endDateError && <div className={SeeCourseCSS.dateInputError}>{endDateError}</div>}
                </div>
            </div>

            {/* Spotify Track */}
            <h3 className={SeeCourseCSS.sectionTitle}>Spotify Track</h3>

            <div className={SeeCourseCSS.spotifyContainer}>
                {course?.spotifyTrack ? (
                    <>
                        <iframe
                            src={`https://open.spotify.com/embed/track/${getSpotifyId(course.spotifyTrack.spotifyUrl)}`}
                            width="100%"
                            height="80"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            className={SeeCourseCSS.spotifyPlayer}
                        ></iframe>

                        <a
                            href={course.spotifyTrack.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={SeeCourseCSS.spotifyLink}
                        >
                            Listen via Spotify
                        </a>

                        {isEditing && (
                            <button
                                className={SeeCourseCSS.deleteButton}
                                onClick={handleDeleteSpotifyTrack}
                            >
                                X
                            </button>
                        )}
                    </>
                ) : (
                    <p className={SeeCourseCSS.noTrack}>No track assigned!</p>
                )}

                {isEditing && (
                    <p className={SeeCourseCSS.spotifyTrackText}>
                        <input
                            type="text"
                            name="spotifyTrackName"
                            value={course?.spotifyTrack?.name || ''}
                            onChange={handleInputChange}
                            className={SeeCourseCSS.spotifyInput}
                            onClick={handleOpenDialog}
                            placeholder="Search or add Spotify track"
                        />
                    </p>
                )}
            </div>

            {/* Search bar for spotify tracks */}
            {dialogOpen && (
                <SpotifySearch
                    openDialog={dialogOpen}
                    setOpenDialog={setDialogOpen}
                    setSelectedTrack={handleSaveTrack}
                />
            )}

            {/* Images container */}
            {course?.images?.length >= 0 && (
                <div className={SeeCourseCSS.imagesSection}>
                    {course?.images?.length > 0 && (
                        <h3 className={SeeCourseCSS.fileTitle}>Images</h3>
                    )}

                    {/* Upload images */}
                    {isEditing && (
                        <div className={SeeCourseCSS.uploadContainer}>
                            <label htmlFor="image-upload" className={SeeCourseCSS.uploadWrapper}>
                                <div className={SeeCourseCSS.iconBox}>
                                    <FiUpload className={SeeCourseCSS.icon} />
                                </div>
                                <span className={SeeCourseCSS.uploadText}>Upload images</span>
                            </label>
                            <input
                                type="file"
                                id="image-upload"
                                multiple
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, "image")}
                                className={SeeCourseCSS.uploadInput}
                            />
                        </div>
                    )}

                    <div className={SeeCourseCSS.imgContainer}>
                        {Array.isArray(course?.images) &&
                            course.images.map((img, index) => (
                                <div key={index} className={SeeCourseCSS.imageWrapper}>

                                    {/* Delete image */}
                                    {isEditing && (
                                        <button
                                            onClick={() => handleDeleteImage(index, false)}
                                            className={SeeCourseCSS.deleteFileButton}
                                        >
                                            X
                                        </button>
                                    )}

                                    {/* Full screen images */}
                                    {img?.fileData ? (
                                        <img
                                            src={`data:image/jpeg;base64,${img.fileData}`}
                                            onClick={() => openFullscreenImages(index)}
                                            alt={img.name}
                                            className={SeeCourseCSS.imgThumb}
                                        />
                                    ) : (
                                        <div className={SeeCourseCSS.noImageAvailable}>
                                            <p>Image not available</p>
                                        </div>
                                    )}
                                </div>
                            ))}

                        {/* Delete image preview */}
                        {imagesPreview.length > 0 &&
                            imagesPreview.map((preview, index) => (
                                <div key={`preview-${index}`} className={SeeCourseCSS.imageWrapper}>
                                    {isEditing && (
                                        <button
                                            onClick={() => handleDeleteImage(index, true)}
                                            className={SeeCourseCSS.deleteFileButton}
                                        >
                                            X
                                        </button>
                                    )}
                                    <img src={preview.fileData} alt="Preview" className={SeeCourseCSS.imgThumb} />
                                </div>
                            ))}
                    </div>

                    {/* Navigate images in full screen mode */}
                    {selectedImageIndex !== null && (
                        <div className={SeeCourseCSS.fullscreenOverlay} onClick={closeFullscreenImage}>
                            <div className={SeeCourseCSS.fullscreenContent} onClick={(e) => e.stopPropagation()}>
                                <button onClick={showPrevImage} className={`${SeeCourseCSS.navButton} ${SeeCourseCSS.leftButton}`}>&lt;</button>

                                <img
                                    src={selectedImage.fileData.startsWith("data:") || selectedImage.fileData.startsWith("blob:")
                                        ? selectedImage.fileData
                                        : `data:image/jpeg;base64,${selectedImage.fileData}`
                                    }
                                    alt="Fullscreen"
                                    className={SeeCourseCSS.fullscreenImage}
                                />

                                <button onClick={showNextImage} className={`${SeeCourseCSS.navButton} ${SeeCourseCSS.rightButton}`}>&gt;</button>

                                <button className={SeeCourseCSS.closeButton} onClick={closeFullscreenImage}>
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Videos container */}
            {course?.videos?.length >= 0 && (
                <div className={SeeCourseCSS.imagesSection}>
                    {course?.videos?.length > 0 && (
                        <h3 className={SeeCourseCSS.fileTitle}>Videos</h3>
                    )}

                    {/* Upload videos */}
                    {isEditing && (
                        <div className={SeeCourseCSS.uploadContainer}>
                            <label htmlFor="video-upload" className={SeeCourseCSS.uploadWrapper}>
                                <div className={SeeCourseCSS.iconBox}>
                                    <FiUpload className={SeeCourseCSS.icon} />
                                </div>
                                <span className={SeeCourseCSS.uploadText}>Upload videos</span>
                            </label>
                            <input
                                type="file"
                                id="video-upload"
                                multiple
                                accept="video/*"
                                onChange={(e) => handleFileChange(e, "video")}
                                className={SeeCourseCSS.uploadInput}
                            />
                        </div>
                    )}

                    <div className={SeeCourseCSS.imgContainer}>
                        {course.videos?.map((video, index) => (
                            <div key={`old-${video.id}`} className={SeeCourseCSS.imageWrapper}>

                                {/* Delete videos */}
                                {isEditing && (
                                    <button
                                        onClick={() => handleDeleteVideo(index, false)}
                                        className={SeeCourseCSS.deleteFileButton}
                                    >
                                        X
                                    </button>
                                )}
                                <video
                                    className={SeeCourseCSS.imgThumb}
                                    onClick={() => openFullscreenVideo(index)}
                                    muted
                                    preload="metadata"
                                >
                                    <source
                                        src={`data:video/mp4;base64,${video.fileData}`}
                                        type="video/mp4"
                                    />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ))}

                        {/* Delete videos preview */}
                        {videosPreview.map((preview, index) => (
                            <div key={`new-${index}`} className={SeeCourseCSS.imageWrapper}>
                                {isEditing && (
                                    <button
                                        onClick={() => handleDeleteVideo(index, true)}
                                        className={SeeCourseCSS.deleteFileButton}
                                    >
                                        X
                                    </button>
                                )}

                                {/* Open video in full screen */}
                                <video
                                    className={SeeCourseCSS.imgThumb}
                                    onClick={() => openFullscreenVideo(course.videos.length + index)}
                                    muted
                                    preload="metadata"
                                >
                                    <source
                                        src={preview.fileData}
                                        type="video/mp4"
                                    />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ))}
                    </div>

                    {/* Navigate videos in full screen mode */}
                    {selectedVideoIndex !== null && (
                        <div className={SeeCourseCSS.fullscreenOverlay} onClick={closeFullscreenVideo}>
                            <div className={SeeCourseCSS.fullscreenContent} onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={showPrevVideo}
                                    className={`${SeeCourseCSS.navButton} ${SeeCourseCSS.leftButton}`}
                                >
                                    &lt;
                                </button>

                                <video
                                    src={
                                        selectedVideo?.fileData?.startsWith("data:") ||
                                            selectedVideo?.fileData?.startsWith("blob:")
                                            ? selectedVideo.fileData
                                            : `data:video/mp4;base64,${selectedVideo.fileData}`
                                    }
                                    controls
                                    className={SeeCourseCSS.fullscreenImage}
                                />

                                <button
                                    onClick={showNextVideo}
                                    className={`${SeeCourseCSS.navButton} ${SeeCourseCSS.rightButton}`}
                                >
                                    &gt;
                                </button>

                                <button className={SeeCourseCSS.closeButton} onClick={closeFullscreenVideo}>
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <Metronome />

            <div className={SeeCourseCSS.buttonGroup}>
                {isEditing && (
                    <button onClick={handleSave} className={`${SeeCourseCSS.actionButton} ${SeeCourseCSS.save}`}>
                        Save
                    </button>
                )}

                {userRole == 'INSTRUCTOR' && (
                    <button onClick={handleEditClick} className={`${SeeCourseCSS.actionButton} ${isEditing ? SeeCourseCSS.cancel : SeeCourseCSS.edit}`}>
                        {isEditing ? "Cancel" : "Edit"}
                    </button>
                )}

                {!isEditing && (
                    <button onClick={getBack} className={`${SeeCourseCSS.actionButton} ${SeeCourseCSS.exit}`}>
                        Exit
                    </button>
                )}
            </div>
        </div>
    );
}

export default SeeCourseComponent;
