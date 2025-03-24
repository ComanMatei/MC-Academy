import './courses_list.css';

import DataTable from "react-data-table-component";
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";


const CoursesComponent = () => {
    const navigate = useNavigate();
    const dialogRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [perPage, setPerPage] = useState(10);

    const [courses, setCourses] = useState([]);
    const [courseId, setCourseId] = useState('');

    const [instructorId, setInstructorId] = useState('');

    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState("");

    const [students, setStudents] = useState([]);
    const [studentIds, setStudentIds] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);

    useEffect(() => {
        const authData = localStorage.getItem("auth");
        const parsedAuth = authData ? JSON.parse(authData) : null;
        const email = parsedAuth?.email || null;

        findInstructor(email);
    }, []);

    useEffect(() => {
        if (instructorId && selectedInstrument) {
            fetchTableData(instructorId, selectedInstrument);
        }
    }, [instructorId, selectedInstrument]);

    useEffect(() => {
        if (instructorId) {
            getInstrInstruments(instructorId);
        }
    }, [instructorId]);

    useEffect(() => {
        if (instruments.length > 0 && !selectedInstrument) {
            console.log("The starting instrument is: " + instruments[0]);
            setSelectedInstrument(instruments[0]);
        }
    }, [instruments, selectedInstrument]);

    useEffect(() => {
        if (selectedInstrument && instructorId) {
            getAssignedStudents(instructorId, selectedInstrument);
        }
    }, [selectedInstrument, instructorId]);

    useEffect(() => {
        console.log("State-ul instrumentelor actualizat:", instruments);
    }, [instruments]);

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
    }

    const getInstrInstruments = async (instructorId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/instructor/instruments/${instructorId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            })

            if (response.ok) {
                const data = await response.json();
                setInstruments(data);
                console.log("Instrumentele instructorului:", data);
            }
        } catch (err) {
            console.error("Eroare la fetch:", err);
        }
    }

    const deleteCourse = async (courseId) => {

        try {
            const response = await fetch(`http://localhost:8080/api/v1/course/delete/${courseId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            })

            if (response.ok) {
                const data = await response;
                setCourses(courses.filter(course => course.id !== courseId));
                setCourseId('');
            }
        } catch (err) {
            console.error("Error to fetch:", err);
        }
    }

    const fetchTableData = async (instructorId, selectedInstrument) => {
        setLoading(true);

        console.log("Calling for the selected tool:", selectedInstrument);
        console.log("Calling for id:", instructorId);

        try {
            const response = await fetch(`http://localhost:8080/api/v1/course/${instructorId}?instrument=${selectedInstrument}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);

                const transformedData = data.map(item => ({
                    id: item.id,
                    name: item.name,
                    startDate: item.startDate,
                    endDate: item.endDate
                }));

                setCourses(transformedData);
            } else {
                console.error('Error:', response.status);
            }
        } catch (err) {
            console.error("Eroare:", err);
        } finally {
            setLoading(false);
        }
    }

    const getAssignedStudents = async (instructorId, selectedInstrument) => {
        console.log("Instrumentul ales: " + selectedInstrument + " instructor: " + instructorId);

        try {
            const response = await fetch(`http://localhost:8080/api/v1/instructor/assigned/${instructorId}?instrument=${selectedInstrument}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Incoming students:", data);
                setStudents(data);
            }
        } catch (err) {
            console.error("Erorr", err);
        }
    }

    const handleCourseClick = (courseId) => {
        navigate(`/course/${courseId}`);
    };

    const handleCheckboxCourses = (courseId) => {
        setSelectedCourses(prev => prev.includes(courseId)
            ? prev.filter(id => id !== courseId)
            : [...prev, courseId]
        );
        console.log(courseId)
    };

    const handleCheckboxStudents = (studentId) => {
        setStudentIds(prev => prev.includes(studentId)
            ? prev.filter(id => id !== studentId)
            : [...prev, studentId]
        );
        console.log(studentId)
    };

    const shareCourses = async () => {
        console.log("Courses selected:", selectedCourses);
        console.log("Students selected:", studentIds);

        const assignCourses = { courseIds: selectedCourses, studentIds }

        try {
            const response = await fetch('http://localhost:8080/api/v1/course/assign-students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(assignCourses),
                withCredentials: true
            });

            if (response.ok) {
                const data = await response;
                console.log(data);

                setSelectedCourses([]);
                setStudentIds([]);
            }
        } catch (err) {
            console.error("Eroare:", err);
        }
    };

    const handleOpenDialog = async () => {
        await getAssignedStudents(instructorId, selectedInstrument);
        console.log("Open dialog");
        if (dialogRef.current) {
            dialogRef.current.showModal();
        } else {
            console.log("Dialogul doesn't exist");
        }
    };

    const handleCloseDialog = () => {
        if (dialogRef.current) {
            dialogRef.current.close();
        } else {
            console.error("Dialogue not found");
        }
    };

    const studentColumns = [
        {
            name: "",
            cell: (row) => (
                <input
                    type="checkbox"
                    checked={studentIds.includes(row.id)}
                    onChange={() => handleCheckboxStudents(row.id)}
                />
            ),
            width: "50px"
        },
        { name: "First name", selector: (row) => row.firstname },
        { name: "Last name", selector: (row) => row.lastname },
        { name: "Email", selector: (row) => row.email },
    ];

    const columns = [
        {
            name: "",
            cell: (row) => (
                <input
                    type="checkbox"
                    checked={selectedCourses.includes(row.id)}
                    onChange={() => handleCheckboxCourses(row.id)}
                />
            ),
            width: "50px"
        },
        {
            name: "Name",
            selector: (row) => row.name,
            cell: (row) => (
                <button
                    onClick={() => handleCourseClick(row.id)}
                    style={{
                        background: "none",
                        border: "none",
                        color: "blue",
                        textDecoration: "underline",
                        cursor: "pointer",
                    }}
                >
                    {row.name}
                </button>
            ),
        },
        {
            name: "Start date",
            selector: (row) => row.startDate,
        },
        {
            name: "End date",
            selector: (row) => row.endDate,
        },
        {
            name: "Delete",
            cell: (row) => (
                <button onClick={() => deleteCourse(row.id)}>
                    Delete
                </button>
            ),
        },
    ]

    return (
        <div style={{ position: "relative" }}>
            <h2>List of courses</h2>

            <button className="share-btn" onClick={handleOpenDialog}>Share</button>
            {
                instruments.length > 0 ? (
                    instruments.map((instrument, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setSelectedInstrument(instrument);
                                fetchTableData(instructorId, instrument);
                            }}
                        >
                            {instrument}
                        </button>
                    ))
                ) : (
                    <p>There are no assigned instruments.</p>
                )
            }

            <div>
                <DataTable
                    title="List of locked instructors"
                    columns={columns}
                    data={courses}
                    progressPending={loading}
                />
            </div>

            <dialog ref={dialogRef} className="custom-dialog">
                <h2>Students list</h2>
                <DataTable columns={studentColumns} data={students} pagination />

                <button className="close-btn" onClick={handleCloseDialog}>
                    Close
                </button>
                <button className="close-btn" onClick={shareCourses}>
                    Assign
                </button>
            </dialog>
        </div>
    )

}

export default CoursesComponent