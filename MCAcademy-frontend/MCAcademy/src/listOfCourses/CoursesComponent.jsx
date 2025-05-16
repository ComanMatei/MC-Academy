import './courses_list.css';

import SearchBar from '../search-bar/SearchBar';
import DataTable from "react-data-table-component";

import { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";

import AuthContext from "../context/AuthProvider";
import { getStudentSpecializations } from '../service/StudentService';
import { findAllSpec } from '../service/InstructorService';
import { getAllCourses } from '../service/CourseService';
import { getAssignedStudents } from '../service/InstructorService';
import { shareCourses } from '../service/CourseService';
import { deleteCourse } from '../service/CourseService';
import { markCourseAsHistory } from '../service/CourseService';
import { getStudentCourses } from '../service/StudentService';

const CoursesComponent = () => {
    const { auth } = useContext(AuthContext);
    const token = auth?.accessToken;
    const userId = auth?.userId;
    const userRole = auth?.roles;

    const navigate = useNavigate();
    const dialogRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [perPage, setPerPage] = useState(10);
    const [viewMode, setViewMode] = useState(false);

    const [filteredCourses, setFilteredCourses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [courseId, setCourseId] = useState('');

    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState("");

    const [students, setStudents] = useState([]);
    const [studentIds, setStudentIds] = useState([]);
    const [student, setStudent] = useState('');

    const [selectedCourses, setSelectedCourses] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    // Student initializations
    const [studentSpec, setStudentSpec] = useState([]);
    const [selectedInstructor, setSelectedInstructor] = useState('');

    const uniqueInstructors = [
        ...new Map(
            studentSpec.map(spec => [
                spec.instructorId,
                {
                    id: spec.instructorId,
                    firstname: spec.firstname,
                    lastname: spec.lastname,
                }
            ])
        ).values()
    ];

    useEffect(() => {
        if (selectedInstructor) {
            console.log("Selected instructor: " + selectedInstructor);
        }
    }, [selectedInstructor]);

    useEffect(() => {
        if (studentSpec.length > 0) {
            setSelectedInstructor(studentSpec[0].instructorId);
        }
    }, [studentSpec]);

    useEffect(() => {
        if (studentSpec.length > 0) {
            setSelectedInstrument(studentSpec[0].instrument);
        }
    }, [studentSpec]);

    useEffect(() => {
        if (userRole == 'STUDENT') {
            const fetchStudent = async () => {
                const studentsSpec = await getStudentSpecializations(userId, token);
                setStudentSpec(studentsSpec);
                console.log("Student specializations:", studentsSpec);
            };

            fetchStudent();
        }
    }, [userRole]);
    //const fetchTableData = async (userId, selectedInstructor, viewMode, instrument, token)
    useEffect(() => {
        if (userId && selectedInstrument) {
            console.log("Selected instrument:", selectedInstructor);
            fetchTableData(
                userId,
                selectedInstructor,
                viewMode,
                selectedInstrument.instrument || selectedInstrument,
                token
            );
        }
    }, [userId, selectedInstrument, selectedInstructor, viewMode]);

    useEffect(() => {
        if (instruments.length > 0 && !selectedInstrument) {
            console.log("The starting instrument is: " + instruments[0]);
            setSelectedInstrument(instruments[0]);
        }
    }, [instruments, selectedInstrument]);

    useEffect(() => {
        setFilteredCourses(courses);
    }, [courses]);

    useEffect(() => {
        const fetchInstruments = async () => {
            if (userId) {
                const instruments = await findAllSpec(userId, token);
                setInstruments(instruments);
                console.log("Instruments:", instruments);
            }
        };
        fetchInstruments();
    }, [userId]);

    useEffect(() => {
        const markCourses = async () => {
            for (const course of courses) {
                const endDate = new Date(course.endDate).getTime();

                if (Date.now() > endDate && course.isHistory == false) {
                    await markCourseAsHistory(course.id, token);
                    console.log("Course marked as history:", course.id);
                }
            }
        };

        if (courses.length > 0 && token) {
            markCourses();
        }
    }, [courses, token]);

    const handleDeleteCourse = async (courseId, token) => {

        await deleteCourse(userId, courseId, token)

        setCourses(courses.filter(course => course.id !== courseId));
        setCourseId('');
    }

    const fetchTableData = async (userId, selectedInstructor, viewMode, instrument, token) => {
        setLoading(true);

        let transformedData = [];
        console.log("Selected userId:", userId);
        console.log("Selected instrument:", instrument);
        console.log("Selected viewMode:", viewMode);
        console.log("Selected selectedInstructor:", selectedInstructor);

        if (userRole == 'INSTRUCTOR') {
            const data = await getAllCourses(userId, instrument, viewMode, token);
            transformedData = data.map(item => ({
                id: item.id,
                name: item.name,
                startDate: item.startDate,
                endDate: item.endDate
            }));
        }

        if (userRole == 'STUDENT' && instrument) {
            const data = await getStudentCourses(userId, selectedInstructor, viewMode, instrument, token);
            transformedData = data.map(item => ({
                id: item.id,
                name: item.name,
                startDate: item.startDate,
                endDate: item.endDate
            }));
        }

        setCourses(transformedData);
        setLoading(false);
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

    const shareStudentsCourses = async () => {
        console.log("Courses selected:", selectedCourses);
        console.log("Students selected:", studentIds);

        const assignCourses = { courseIds: selectedCourses, studentIds }

        await shareCourses(userId, assignCourses, token);

        setSelectedCourses([]);
        setStudentIds([]);
    }

    const getInstrumentsForInstructor = (instructorId) => {
        const instruments = studentSpec
            .filter(assign => assign.instructorId == instructorId)
            .map(assign => assign.instrument)
            .filter((value, index, self) => self.indexOf(value) === index);
        return instruments;
    };

    const handleOpenDialog = async () => {
        const students = await getAssignedStudents(userId, "APPROVED", selectedInstrument.instrument, token);
        setStudents(students);
        console.log("Students:", students);
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
                    checked={studentIds.includes(row.userId)}
                    onChange={() => handleCheckboxStudents(row.userId)}
                />
            ),
            width: "50px"
        },
        { name: "First name", selector: (row) => row.firstname },
        { name: "Last name", selector: (row) => row.lastname },
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
                <button onClick={() => handleDeleteCourse(row.id, token)}>
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
                                {instrument.instrument}
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
                                setSelectedInstrument(instrument); // Doar setezi instrumentul
                            }}
                        >
                            {instrument}
                        </button>
                    ))}
                </div>
            )}
            <div className='inline-container'>
                <div className='seach-container'>
                    <SearchBar
                        data={courses}
                        setResults={setFilteredCourses}
                        type="courses"
                    />
                </div>

                <div className='course-activity'>
                    <button
                        className={viewMode == false ? "selected" : ""}
                        onClick={() => {
                            setViewMode(false);
                        }}
                    >
                        Activ
                    </button>
                    <button
                        className={viewMode == true ? "selected" : ""}
                        onClick={() => {
                            setViewMode(true);
                        }}
                    >
                        History
                    </button>
                </div>
            </div>

            <DataTable
                title="List of courses"
                columns={columns}
                data={searchResults.length > 0 ? searchResults : filteredCourses}
                progressPending={loading}
            />

            <dialog ref={dialogRef} className="custom-dialog">
                <h2>Students list</h2>
                <DataTable columns={studentColumns} data={students} pagination />

                <button className="close-btn" onClick={handleCloseDialog}>
                    Close
                </button>
                <button className="close-btn" onClick={shareStudentsCourses}>
                    Assign
                </button>
            </dialog>
        </div>
    )

}

export default CoursesComponent