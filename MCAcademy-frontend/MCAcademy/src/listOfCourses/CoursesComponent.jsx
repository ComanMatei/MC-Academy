import './courses_list.css';

import SearchBar from '../search-bar/SearchBar';
import DataTable from "react-data-table-component";

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";

import { getInstructor } from '../service/UserService';
import { getStudent } from '../service/UserService';

const CoursesComponent = () => {
    const navigate = useNavigate();
    const dialogRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [perPage, setPerPage] = useState(10);

    const [filteredCourses, setFilteredCourses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [courseId, setCourseId] = useState('');

    const [instructor, setInstructor] = useState('');
    const [userRole, setUserRole] = useState("");

    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState("");

    const [students, setStudents] = useState([]);
    const [studentIds, setStudentIds] = useState([]);
    const [student, setStudent] = useState('');

    const [selectedCourses, setSelectedCourses] = useState([]);

    // Student initializations
    const [studentSpec, setStudentSpec] = useState([]);
    const [selectedInstructor, setSelectedInstructor] = useState('');

    const uniqueInstructors = [...new Map(studentSpec.map(spec => [spec.instructor.id, spec.instructor])).values()];

    useEffect(() => {
        if (studentSpec.length > 0) {
            setSelectedInstructor(studentSpec[0].instructor.id);
        }
    }, [studentSpec]);

    useEffect(() => {
        if (studentSpec.length > 0) {
            setSelectedInstrument(studentSpec[0].instrument);
        }
    }, [studentSpec]);

    useEffect(() => {
        const authData = localStorage.getItem("auth");
        const parsedAuth = authData ? JSON.parse(authData) : null;
        const email = parsedAuth?.email || null;
        const role = parsedAuth?.roles || null;

        setUserRole(role);

        const fetchUserData = async () => {
            if (role == 'INSTRUCTOR') {
                const instructor = await getInstructor(email);
                setInstructor(instructor);
            }
            else {
                const student = await getStudent(email);
                setStudent(student);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (student && student.id) {
            getStudentSpecializations();
        }
    }, [student]);

    useEffect(() => {
        if (instructor && selectedInstrument) {
            fetchTableData(instructor.id, selectedInstrument);
        }
    }, [instructor, selectedInstrument]);

    useEffect(() => {
        if (instructor && instructor.id) {
            getInstrInstruments(instructor.id);
        }
    }, [instructor]);

    useEffect(() => {
        if (selectedInstrument) {
            if (userRole == 'STUDENT') {
                console.log("selec: " + selectedInstrument)
                getStudentCourses(selectedInstrument);
            }
        }
    }, [selectedInstrument]);

    useEffect(() => {
        if (instruments.length > 0 && !selectedInstrument) {
            console.log("The starting instrument is: " + instruments[0]);
            setSelectedInstrument(instruments[0]);
        }
    }, [instruments, selectedInstrument]);

    useEffect(() => {
        if (selectedInstrument && instructor) {
            getAssignedStudents(instructor.id, selectedInstrument);
        }
    }, [selectedInstrument, instructor]);

    useEffect(() => {
        // Dacă se modifică searchQuery, filtrăm cursurile
        setFilteredCourses(courses);
    }, [courses]);

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
                setFilteredCourses(transformedData);
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
                console.log("Sanded!");

                setSelectedCourses([]);
                setStudentIds([]);
            }
        } catch (err) {
            console.error("Error: ", err);
        }
    };

    const getStudentSpecializations = async () => {
        const studentId = student.id;
        try {
            const response = await fetch(`http://localhost:8080/api/v1/student/specializations/${studentId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Received data:", data);

                setStudentSpec(data);
            }
        } catch (err) {
            console.error("Error: ", err);
        }
    }

    const getStudentCourses = async (instrument) => {
        const studentId = student.id;
        console.log("studentId: " + studentId);
        console.log("selectedInstructor: " + selectedInstructor);
        console.log("selectedInstrument: " + instrument);

        try {
            const response = await fetch(`http://localhost:8080/api/v1/course/studentcourses/${studentId}/${selectedInstructor}/${instrument}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.ok) {
                const data = await response.json();
                setCourses(data);

                console.log(data);
            }
        } catch (err) {
            console.error("Error: ", err);
        }
    };

    const getInstrumentsForInstructor = (instructorId) => {
        const instruments = studentSpec
            .filter(assign => assign.instructor.id == instructorId)
            .map(assign => assign.instrument)
            .filter((value, index, self) => self.indexOf(value) === index);
        return instruments;
    };

    const handleOpenDialog = async () => {
        await getAssignedStudents(instructor.id, selectedInstrument);
        console.log("Open dialog");
        if (dialogRef.current) {
            dialogRef.current.showModal();
        } else {
            console.log("Dialog doesn't exist");
        }
    };

    const handleCloseDialog = () => {
        if (dialogRef.current) {
            dialogRef.current.close();
        } else {
            console.error("Dialogue not found");
        }
    };

    const handleCourseClick = (courseId) => {
        navigate(`/course/${courseId}`);
    };

    const handleCrateCourse = () => {
        navigate('/course');
    };

    const goBack = () => {
        if (userRole == 'INSTRUCTOR') {
            navigate('/instructor');
        }
        else {
            navigate(-1);
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

            <div style={{ display: "flex" }}>
                {userRole == 'INSTRUCTOR' && (
                    <>
                        <button className="share-btn" onClick={handleOpenDialog}>Share</button>
                        <button className="create-btn" onClick={handleCrateCourse}>Create course</button>
                    </>
                )}
                <button className="exit-btn" onClick={goBack}>Back</button>
            </div>

            {userRole == 'STUDENT' && studentSpec.length > 0 && (
                <div>
                    <label htmlFor="instructorSelect">Selectează un instructor: </label>
                    <select
                        id="instructorSelect"
                        value={selectedInstructor}
                        onChange={(e) => setSelectedInstructor(e.target.value)}
                    >
                        <option value="">-- Alege un instructor --</option>
                        {uniqueInstructors.map((instructor) => (
                            <option key={instructor.id} value={instructor.id}>
                                {instructor.firstname} {instructor.lastname}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {userRole == 'INSTRUCTOR' && instruments.length > 0 && (
                <div>
                    <label>Alege un instrument: </label>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {instruments.map((instrument, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedInstrument(instrument)}
                            >
                                {instrument}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {userRole == 'STUDENT' && selectedInstructor && (
                <div>
                    {getInstrumentsForInstructor(selectedInstructor).map((instrument, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setSelectedInstrument(instrument);

                                getStudentCourses(instrument);
                            }}
                        >
                            {instrument}
                        </button>
                    ))}
                </div>
            )}
            <div className='seach-container'>
                <SearchBar
                    data={courses}  
                    setResults={setFilteredCourses} 
                    type = "courses"
                />
            </div>

            <div>
                <DataTable
                    title="List of locked instructors"
                    columns={columns}
                    data={filteredCourses}
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