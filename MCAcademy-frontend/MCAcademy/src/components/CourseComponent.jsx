import { useState, useEffect } from "react";
import SpotifySearch from "./SpotifySearch";


const CourseComponent = () => {

    const [files, setFiles] = useState([]);

    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [instructorId, setInstructorId] = useState('');
    const [savedTrack, setSavedTrack] = useState(null);
    const [imageIds, setImageIds] = useState([]);
    const [videoIds, setVideoIds] = useState([]);

    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState('');

    useEffect(() => {
        if (files.length > 0) {
            files.forEach(file => {
                console.log(file.name);
            });
        }
    }, [files]);

    useEffect(() => {
        if (startDate || endDate || name || savedTrack || imageIds || videoIds) {
            console.log(" Start: " + startDate + " End: " + endDate + " Name: " + name + " Track: " + savedTrack);
            console.log("Imagini: " + imageIds + " Videos :" + videoIds)
        }
    }, [startDate, endDate, name, savedTrack, imageIds, videoIds])

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
            console.error("Eroare la fetch:", err);
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
            console.error("Eroare:", err);
        }
    }

    const handleFileChange = (event) => {
        // Actualizăm starea cu fișierele selectate
        setFiles(Array.from(event.target.files)); // Folosim Array.from pentru a transforma FileList într-un array
    };

    const createImages = async () => {
        if (!files) {
            console.log("Nu a fost selectat niciun fișier!");
            return;
        }
    
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('file', file);
        });
    
        try {
            const response = await fetch('http://localhost:8080/api/v1/file/create-image', {
                method: 'POST',
                body: formData,
                withCredentials: true
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log("Full response data:", data); // DEBUG
    
                if (Array.isArray(data) && data.length > 0) {
                    const ids = data.map((file) => file.id); // Extrage ID-urile
    
                    // Adaugă doar imaginile
                    setImageIds((prev) => [...prev, ...ids]);
                    console.log("Extracted image IDs:", ids);
                } else {
                    console.error("Unexpected response structure:", data);
                }
            } else {
                console.error('Request failed with status:', response.status);
            }
        } catch (error) {
            console.error('Failed to upload files:', error);
        }
    
        setFiles([]);
    };

    const createVideos = async () => {
        if (!files) {
            console.log("Nu a fost selectat niciun fișier!");
            return;
        }
    
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('file', file);
        });
    
        try {
            const response = await fetch('http://localhost:8080/api/v1/file/create-video', {
                method: 'POST',
                body: formData,
                withCredentials: true
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log("Full response data:", data); // DEBUG
    
                if (Array.isArray(data) && data.length > 0) {
                    const ids = data.map((file) => file.id); // Extrage ID-urile
    
                    // Adaugă doar imaginile
                    setVideoIds((prev) => [...prev, ...ids]);
                    console.log("Extracted image IDs:", ids);
                } else {
                    console.error("Unexpected response structure:", data);
                }
            } else {
                console.error('Request failed with status:', response.status);
            }
        } catch (error) {
            console.error('Failed to upload files:', error);
        }
    
        setFiles([]);
    };

    const createCourse = async () => {

        const course = { name, startDate, endDate, instructorId, instrument: selectedInstrument.instrument, spotifyTrack: savedTrack, imageIds, videoIds }

        console.log(course);

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
                const data = response.json();
                console.log(data);
            }
        } catch (error) {
            console.error('Failed to parse JSON:', error);
        }
    }

    const handleSelectInstrument = (event) => {
        const instrumentId = event.target.value;  // Trebuie să folosești valoarea
        const selectedInst = instruments.find(inst => inst.id === parseInt(instrumentId));  // Căutăm instrumentul pe baza ID-ului
        setSelectedInstrument(selectedInst); // Setează întregul obiect instrument
    };

    return (
        <div>
            <SpotifySearch onTrackSave={(track) => {
                console.log("Track primit din SpotifySearch:", track);
                setSavedTrack(track);
            }} />

            <input type="file" name="images" multiple onChange={handleFileChange} />
            <button onClick={createImages}>Images</button> <br />

            <input type="file" name="videos" multiple onChange={handleFileChange} />
            <button onClick={createVideos}>Videos</button> <br />

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
            </select> <br />

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