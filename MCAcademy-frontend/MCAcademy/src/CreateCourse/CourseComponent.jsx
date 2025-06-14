import { useContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import { createImages } from "../service/FileService";
import { createVideos } from "../service/FileService";
import { assignFilesToCourse } from "../service/CourseService";
import { findAllSpec } from "../service/InstructorService";

import SpotifySearch from "../spotifyTrack/SpotifySearch";
import AuthContext from "../context/AuthProvider";

import CreateCourseCSS from './createCourse.module.css'
import { FiUpload } from "react-icons/fi";
import { FaSpotify } from "react-icons/fa";

const CourseComponent = () => {

    const { auth } = useContext(AuthContext);
    const token = auth?.accessToken;
    const userId = auth?.userId;

    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [spotifyTrack, setSpotifyTrack] = useState(null);

    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState('');

    const [openDialog, setOpenDialog] = useState(false);

    // File variables
    const [imagesPreview, setImagesPreview] = useState([]);
    const [images, setImages] = useState([]);

    const [videosPreview, setVideosPreview] = useState([]);
    const [videos, setVideos] = useState([]);

    // Custom errors variables
    const [startDate, setStartDate] = useState('');
    const [startDateError, setStartDateErro] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endDateError, setEndDateError] = useState('');

    const [nameError, setNameError] = useState('');

    // Instrument emojis mapping
    const instrumentEmojis = {
        DRUMS: "🥁",
        GUITAR: "🎸",
        PIANO: "🎹",
        VIOLIN: "🎻",
        FLUTE: "🎶",
    };

    // Custom errors for dates
    useEffect(() => {
        let startError = '';
        let endError = '';

        if (!startDate) {
            startError = 'Start date is required.';
        }

        if (!endDate) {
            endError = 'End date is required.';
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (start > end) {
                startError = 'Start date must be before end date.';
                endError = 'End date must be after start date.';
            }
        }

        setStartDateErro(startError);
        setEndDateError(endError);

    }, [startDate, endDate]);

    useEffect(() => {
        const fetchSpec = async () => {
            if (userId) {
                const specializations = await findAllSpec(userId, token);
                setInstruments(specializations);
            }
        };
        fetchSpec();
    }, [userId]);

    const handleFileChange = (event, type) => {
        const selectedFiles = Array.from(event.target.files);

        if (selectedFiles.length == 0) {
            console.log("No file has been selected!");
            return;
        }

        if (type == "image") {
            const imagePreviews = selectedFiles.map(file => {
                return {
                    file: file,
                    fileData: URL.createObjectURL(file)
                };
            });
            setImages(prevImages => [...prevImages, ...selectedFiles]);
            setImagesPreview(prevPreviews => [...prevPreviews, ...imagePreviews]);
        }

        if (type == "video") {
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

    const createCourse = async () => {

        let uploadedImages = [];
        let uploadedVideos = [];

        var isHistory;
        if (Date.now() > new Date(endDate).getTime()) {
            isHistory = true;
        } else {
            isHistory = false;
        }

        const course = {
            name,
            startDate,
            endDate,
            isHistory: isHistory,
            instructorId: userId,
            instrument: selectedInstrument.instrument,
            spotifyTrack,
            images: [],
            videos: []
        };

        try {
            const response = await fetch('http://localhost:8080/api/v1/course/create-course', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(course),
                withCredentials: true
            })

            // If response is ok will assign files to course
            if (response.ok) {
                const data = await response.json();

                if (images.length > 0) {
                    uploadedImages = await createImages(images, token);
                }

                if (videos.length > 0) {
                    uploadedVideos = await createVideos(videos, token);
                }

                const courseFileObj = {
                    courseId: data.id,
                    images: uploadedImages,
                    videos: uploadedVideos
                };

                await assignFilesToCourse(courseFileObj, token);

                setNameError('');
                navigate('/courses')
            }
            else {
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
        } catch (error) {
            console.error('Failed to parse JSON:', error);
        }
    }

    const handleSelectInstrument = (event) => {
        const instrumentId = event.target.value;
        const selectedInst = instruments.find(inst => inst.id == parseInt(instrumentId));

        if (selectedInst) {
            setSelectedInstrument(selectedInst);
        }
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleDeleteImage = (index) => {
        const updatedImagesPreview = imagesPreview.filter((_, i) => i !== index);
        const updatedImages = images.filter((_, i) => i !== index);

        setImagesPreview(updatedImagesPreview);
        setImages(updatedImages);
    };

    const handleDeleteVideo = (index) => {
        const updatedVideosPreview = videosPreview.filter((_, i) => i !== index);
        const updatedVideos = videos.filter((_, i) => i !== index);

        setVideosPreview(updatedVideosPreview);
        setVideos(updatedVideos);
    };

    const handleDeleteSpotifyTrack = () => {
        setSpotifyTrack(null);
    };

    const goBack = () => {
        navigate(-1);
    }

    const spotifyId = spotifyTrack?.spotifyUrl?.split('/').pop();

    return (
        <div className={CreateCourseCSS.wrapper}>
            <div className={CreateCourseCSS.pageWrapper}>
                <div className={CreateCourseCSS.container}>

                    <h3 className={CreateCourseCSS.title}>Create course</h3>
                    <button
                        className={CreateCourseCSS.trackButton}
                        onClick={handleOpenDialog}
                    >
                        <FaSpotify size={20} color="white" /> Spotify track
                    </button>

                    <SpotifySearch
                        openDialog={openDialog}
                        setOpenDialog={setOpenDialog}
                        setSelectedTrack={setSpotifyTrack}
                    />

                    {/* Spotify track container */}
                    {spotifyTrack ? (
                        <div className={CreateCourseCSS.spotifyTrackPreview}>

                            <iframe
                                src={`https://open.spotify.com/embed/track/${spotifyId}`}
                                width="15%"
                                height="80"
                                frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                className={CreateCourseCSS.iframe}
                            ></iframe>

                            <a
                                href={spotifyTrack.spotifyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={CreateCourseCSS.spotifyLink}
                            >
                                Listen via Spotify
                            </a>

                            <button
                                className={CreateCourseCSS.deleteButton}
                                onClick={handleDeleteSpotifyTrack}
                            >
                                X
                            </button>
                        </div>
                    ) : (
                        <p className="text-gray-500">No track assigned.</p>
                    )}

                    {/* Upload images */}
                    <label htmlFor="image-upload" className={CreateCourseCSS.uploadWrapper}>
                        <div className={CreateCourseCSS.iconBox}>
                            <FiUpload className={CreateCourseCSS.icon} />
                        </div>
                        <span className={CreateCourseCSS.uploadText}>Upload images</span>
                    </label>
                    <input
                        type="file"
                        id="image-upload"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "image")}
                        className={CreateCourseCSS.fileInput}
                    />

                    {/* Display Images */}
                    {imagesPreview.length > 0 && (
                        <div>
                            <h3 className={CreateCourseCSS.imageTitle}>Selected Images:</h3>
                            <div className={CreateCourseCSS.imgContainer}>
                                {imagesPreview.map((imagePreview, index) => (
                                    <div key={imagePreview.file.name} className={CreateCourseCSS.imageWrapper}>
                                        {imagePreview?.fileData ? (
                                            <div className={CreateCourseCSS.relative}>
                                                <img
                                                    src={imagePreview.fileData}
                                                    alt={`Course image ${index}`}
                                                    className={CreateCourseCSS.imgSmall}
                                                />
                                                <button
                                                    className={CreateCourseCSS.deleteButton}
                                                    onClick={() => handleDeleteImage(index)}
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ) : (
                                            <p>Failed to load image {index}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload videos */}
                    <label htmlFor="video-upload" className={CreateCourseCSS.uploadWrapper}>
                        <div className={CreateCourseCSS.iconBox}>
                            <FiUpload className={CreateCourseCSS.icon} />
                        </div>
                        <span className={CreateCourseCSS.uploadText}>Upload videos</span>
                    </label>
                    <input
                        type="file"
                        id="video-upload"
                        multiple
                        accept="video/*"
                        onChange={(e) => handleFileChange(e, "video")}
                        className={CreateCourseCSS.fileInput}
                    />

                    {/* Display Videos */}
                    {videosPreview.length > 0 && (
                        <div>
                            <h3 className={CreateCourseCSS.imageTitle}>Selected Videos:</h3>
                            <div className={CreateCourseCSS.videoContainer}>
                                {videosPreview.map((videoPreview, index) => (
                                    <div key={videoPreview.file.name} className={CreateCourseCSS.videoWrapper}>
                                        {videoPreview?.fileData ? (
                                            <div className={CreateCourseCSS.relative}>
                                                <video
                                                    src={videoPreview.fileData}
                                                    controls
                                                    className={CreateCourseCSS.videoSmall}
                                                    type="video/mp4"
                                                />
                                                <button
                                                    className={CreateCourseCSS.deleteButton}
                                                    onClick={() => handleDeleteVideo(index)}
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ) : (
                                            <p>Failed to load video {index}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Assigned instruments dropdown */}
                    <div className={CreateCourseCSS.formGroup}>
                        <div className={CreateCourseCSS.row}>
                            <div className={CreateCourseCSS.column}>

                                <div className={CreateCourseCSS.formGroupHalf}>
                                    <div className={CreateCourseCSS.textFieldWrapper}>
                                        <label className={CreateCourseCSS.floatingLabel}>Course name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            onChange={(e) => setName(e.target.value)}
                                            value={name}
                                            className={CreateCourseCSS.textFieldInput}
                                        />
                                        {nameError && <p className={CreateCourseCSS.inputError}>{nameError}</p>}
                                    </div>
                                </div>

                                <div className={CreateCourseCSS.formGroupHalf}>
                                    <div className={CreateCourseCSS.textFieldWrapper}>
                                        <label className={CreateCourseCSS.floatingLabel}>Start date</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            onChange={(e) => setStartDate(e.target.value)}
                                            value={startDate}
                                            className={CreateCourseCSS.inputDate}
                                        />
                                        {startDateError && <p className={CreateCourseCSS.inputError}>{startDateError}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className={CreateCourseCSS.column}>

                                <div className={CreateCourseCSS.formGroupHalf}>
                                    <select
                                        id="instrument"
                                        value={selectedInstrument ? selectedInstrument.id : ""}
                                        onChange={handleSelectInstrument}
                                        className={CreateCourseCSS.select}
                                        disabled={instruments.length == 0}
                                    >
                                        <option value="" disabled>Select instrument</option>
                                        {instruments.map((instrument) => {
                                            const emoji = instrumentEmojis[instrument.instrument.toUpperCase()] || "";
                                            return (
                                                <option key={instrument.id} value={instrument.id}>
                                                    {emoji} {instrument.instrument}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div className={CreateCourseCSS.formGroupHalf}>
                                    <div className={CreateCourseCSS.textFieldWrapper}>
                                        <label className={CreateCourseCSS.floatingLabel}>End date</label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            onChange={(e) => setEndDate(e.target.value)}
                                            value={endDate}
                                            className={CreateCourseCSS.inputDate}
                                        />
                                        {endDateError && <p className={CreateCourseCSS.inputError}>{endDateError}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={CreateCourseCSS.buttonRow}>
                        <button className={CreateCourseCSS.createButton} onClick={createCourse}>
                            Save course
                        </button>
                        <button className={CreateCourseCSS.cancelButton} onClick={goBack}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseComponent;