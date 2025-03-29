import './see_course.css';
import SpotifySearch from "../components/SpotifySearch";

import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import { createImages } from "../service/FileService";
import { createVideos } from "../service/FileService";
import { saveTrack } from '../service/SpotifyTrackService';

const CourseComponent = () => {

    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [instructorId, setInstructorId] = useState('');
    const [spotifyTrack, setSpotifyTrack] = useState(null);

    const [imagesPreview, setImagesPreview] = useState([]);
    const [images, setImages] = useState([]);

    const [videosPreview, setVideosPreview] = useState([]);
    const [videos, setVideos] = useState([]);

    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState('');

    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        const authData = localStorage.getItem("auth");
        const parsedAuth = authData ? JSON.parse(authData) : null;
        const email = parsedAuth?.email || null;

        findInstructor(email);
    }, []);

    useEffect(() => {
        if (instructorId) {
            findAllSpec(instructorId);
        }
    }, [instructorId]);

    const findInstructor = async (email) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/instructor/${email}`, {
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
            console.log("Instructor Data:", data);
            setInstructorId(data.id);

        } catch (err) {
            console.error("Erorr to fetch:", err);
        }
    };

    const findAllSpec = async (instructorId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/instructor/instr-assign/${instructorId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            })

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setInstruments(data);
            } else {
                console.error('Error:', response.status);
            }
        } catch (err) {
            console.error("Erorr:", err);
        }
    }

    const handleFileChange = (event, type) => {
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

    const createCourse = async () => {

        const uploadedImages = await createImages(images);
        const uploadedVideos = await createVideos(videos);

        if (uploadedImages) {
            console.log("Images successfully uploaded:", uploadedImages);
        } else {
            console.log("No images were uploaded.");
        }

        if (uploadedVideos) {
            console.log("Videos successfully uploaded:", uploadedVideos);
        } else {
            console.log("No videos were uploaded.");
        }

        const savedTrack = await saveTrack(spotifyTrack);
        console.log("The song that is coming into play:", savedTrack);

        const course = {
            name,
            startDate,
            endDate,
            instructorId,
            instrument: selectedInstrument.instrument,
            spotifyTrack: savedTrack,
            images: uploadedImages,
            videos: uploadedVideos
        };

        try {
            const response = await fetch('http://localhost:8080/api/v1/course/create-course', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(course),
                withCredentials: true
            })

            if (response.ok) {
                const data = await response.json();
                console.log(data);

                navigate('/courses')
            }
        } catch (error) {
            console.error('Failed to parse JSON:', error);
        }
    }

    const handleSelectInstrument = (event) => {
        const instrumentId = event.target.value;
        const selectedInst = instruments.find(inst => inst.id === parseInt(instrumentId));
        setSelectedInstrument(selectedInst);
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

    return (
        <div>
            <button variant="contained" color="primary" onClick={handleOpenDialog}>
                Add song to course
            </button>

            <SpotifySearch
                openDialog={openDialog}
                setOpenDialog={setOpenDialog}
                setSelectedTrack={setSpotifyTrack}
            />
            <h3 className="mt-4 font-semibold">Spotify Track:</h3>
            {spotifyTrack ? (
                <div className="mt-2 p-4 border rounded-lg shadow-md">
                    <p className="text-lg font-medium">
                        {spotifyTrack.name} - {spotifyTrack.artist}
                    </p>

                    {/* Player Spotify pentru track-ul selectat */}
                    <iframe
                        src={`https://open.spotify.com/embed/track/${spotifyTrack.id}`}
                        width="15%"
                        height="80"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        className="rounded-lg my-2"
                    ></iframe>

                    <a
                        href={spotifyTrack.spotifyUrl}
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

            {/* File Input for Images */}
            <input
                type="file"
                name="images"
                multiple
                onChange={(e) => handleFileChange(e, "image")}
            />

            {/* Display Images */}
            <div className="img-container">
                {imagesPreview.length > 0 && (
                    <div>
                        <h3>Selected Images:</h3>
                        {imagesPreview.map((imagePreview, index) => (
                            <div key={index} className="image-wrapper">
                                {imagePreview?.fileData ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview.fileData}
                                            alt={`Course image ${index}`}
                                            className="img-small"
                                        />
                                        <button
                                            className="delete-button"
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
                )}
            </div> <br />

            <input
                type="file"
                name="videos"
                multiple
                onChange={(e) => handleFileChange(e, "video")}
            />

            {/* Display Videos */}
            <div className="video-container">
                {videosPreview.length > 0 && (
                    <div>
                        <h3>Selected Videos:</h3>
                        {videosPreview.map((videoPreview, index) => (
                            <div key={index} className="video-wrapper">
                                {videoPreview?.fileData ? (
                                    <div className="relative">
                                        <video
                                            src={videoPreview.fileData}
                                            controls
                                            className="video-small"
                                            type="video/mp4"
                                        />
                                        <button
                                            className="delete-button"
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
                )}
            </div>

            <select
                id="instrument"
                value={selectedInstrument ? selectedInstrument.id : ""}
                onChange={handleSelectInstrument}
                className="border border-gray-300 p-2 rounded-lg w-full"
                disabled={instruments.length === 0}
            >
                <option value="" disabled>Select instrument</option>
                {instruments.map((instrument) => (
                    <option key={instrument.id} value={instrument.id}>
                        {instrument.instrument}
                    </option>
                ))}
            </select> <br /> <br />

            <input
                type="date"
                name="startDate"
                onChange={(e) => setStartDate(e.target.value)}
                value={startDate}
            /> <br></br>
            <input
                type="date"
                name="endDate"
                onChange={(e) => setEndDate(e.target.value)}
                value={endDate}
            /> <br></br>

            <input
                type="test"
                name="name"
                onChange={(e) => setName(e.target.value)}
                value={name}
            /> <br></br>

            <button onClick={createCourse}>Save course</button>
        </div>
    )
}

export default CourseComponent