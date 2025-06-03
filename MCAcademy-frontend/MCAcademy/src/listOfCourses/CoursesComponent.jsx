import { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";

import { getStudentSpecializations } from '../service/StudentService';
import { findAllSpec } from '../service/InstructorService';
import { getAllCourses } from '../service/CourseService';
import { getAssignedStudents } from '../service/InstructorService';
import { shareCourses } from '../service/CourseService';
import { deleteCourse } from '../service/CourseService';
import { markCourseAsHistory } from '../service/CourseService';
import { getStudentCourses } from '../service/StudentService';

import SearchBar from '../search-bar/SearchBar';
import DataTable from "react-data-table-component";
import AuthContext from "../context/AuthProvider";

import CoursesCSS from './courses.module.css'
import ShareDialogCSS from './shareDialog.module.css'
import { FiTrash } from "react-icons/fi";

const CoursesComponent = () => {
    const { auth } = useContext(AuthContext);
    const token = auth?.accessToken;
    const userId = auth?.userId;
    const userRole = auth?.roles;

    const navigate = useNavigate();
    const dialogRef = useRef(null);

    const [viewMode, setViewMode] = useState(false);

    const [filteredCourses, setFilteredCourses] = useState([]);
    const [courses, setCourses] = useState([]);

    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState("");

    const [students, setStudents] = useState([]);
    const [studentIds, setStudentIds] = useState([]);

    const [selectedCourses, setSelectedCourses] = useState([]);

    // Student initializations
    const [studentSpec, setStudentSpec] = useState([]);
    const [selectedInstructor, setSelectedInstructor] = useState('');

    // Pagination fields
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = filteredCourses.length == 0 ? 0 : Math.ceil(filteredCourses.length / itemsPerPage);

    // Remove duplicate instructors for dropdown display
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
            };

            fetchStudent();
        }
    }, [userRole]);

    // Returns the list of courses filtered by fields.
    useEffect(() => {
        if (userId && selectedInstrument) {
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
            }
        };
        fetchInstruments();
    }, [userId]);

    // Change course state active to history
    useEffect(() => {
        const markCourses = async () => {
            for (const course of courses) {
                const endDate = new Date(course.endDate).getTime();

                if (Date.now() > endDate && course.isHistory == false) {
                    await markCourseAsHistory(course.id, token);
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
    }

    // Return students/instructors courses
    const fetchTableData = async (userId, selectedInstructor, viewMode, instrument, token) => {
        let transformedData = [];
        let data;

        if (userRole == 'INSTRUCTOR') {
            data = await getAllCourses(userId, instrument, viewMode, token);
        }

        if (userRole == 'STUDENT' && instrument) {
            data = await getStudentCourses(userId, selectedInstructor, viewMode, instrument, token);
        }

        transformedData = data.map(item => ({
            id: item.id,
            name: item.name,
            startDate: item.startDate,
            endDate: item.endDate,
            imageCount: item.imageCount,
            videoCount: item.videoCount,
            hasSpotifyTrack: item.hasSpotifyTrack
        }));

        setCourses(transformedData);
    }

    const handleCheckboxCourses = (courseId) => {
        setSelectedCourses(prev => prev.includes(courseId)
            ? prev.filter(id => id !== courseId)
            : [...prev, courseId]
        );
    };

    const handleCheckboxStudents = (studentId) => {
        setStudentIds(prev => prev.includes(studentId)
            ? prev.filter(id => id !== studentId)
            : [...prev, studentId]
        );
    };

    const shareStudentsCourses = async () => {
        const assignCourses = { courseIds: selectedCourses, studentIds }

        await shareCourses(userId, assignCourses, token);

        setSelectedCourses([]);
        setStudentIds([]);
    }

    // Returns instructor instruments
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

        if (dialogRef.current) {
            dialogRef.current.showModal();
        }
    };

    const handleCloseDialog = () => {
        if (dialogRef.current) {
            dialogRef.current.close();
        }
    };

    const handleCourseClick = (courseId) => {
        navigate(`/course/${courseId}`);
    };

    const handleCrateCourse = () => {
        navigate('/create-course');
    };

    // Students list dialog
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

    // Custom design for students list dialog
    const customStyles = {
        table: {
            style: {
                backgroundColor: '#f0f4ff',
                borderRadius: '8px',
            },
        },
        headRow: {
            style: {
                backgroundColor: '#0b1b77',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1rem',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                overflow: 'hidden',
                marginBottom: 0,
                paddingBottom: 0,
            },
        },
        rows: {
            style: {
                backgroundColor: 'white',
                borderBottom: '1px solid #ccc',
                transition: 'all 0.3s ease',
            },
            highlightOnHoverStyle: {
                backgroundColor: '#e6f0ff',
                color: '#0b1b77',
                cursor: 'pointer',
            },
        },
        headCells: {
            style: {
                padding: '12px',
                marginBottom: 0,
                paddingBottom: 0,
            },
        },
        cells: {
            style: {
                padding: '12px',
                fontSize: '0.95rem',
            },
        },
    };

    return (
        <div className={CoursesCSS.wrapper}>

            {/* Instructor instruments */}
            <div className={CoursesCSS.instrumentButtons}>
                {userRole == 'INSTRUCTOR' && instruments.length > 0 && (
                    <>
                        {instruments.map((instrument, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedInstrument(instrument)}
                                className={`${CoursesCSS.instrumentButton} ${selectedInstrument == instrument ? CoursesCSS.selected : ""}`}
                            >
                                {instrument.instrument}
                            </button>
                        ))}
                    </>
                )}

                {/* students instruments based on instructors */}
                {userRole == 'STUDENT' && selectedInstructor && (
                    <>
                        {getInstrumentsForInstructor(selectedInstructor).map((instrument, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedInstrument(instrument)}
                                className={`${CoursesCSS.instrumentButton} ${selectedInstrument == instrument ? CoursesCSS.selected : ""}`}
                            >
                                {instrument}
                            </button>
                        ))}
                    </>
                )}
            </div>

            <h2 className={CoursesCSS.title}>List of courses</h2>

            <div className={CoursesCSS.inlineContainer}>
                <div className={CoursesCSS.buttonsRow}>

                    {/* Course state */}
                    <div className={CoursesCSS.leftButtons}>
                        <button
                            className={viewMode == false ? CoursesCSS.selected : ""}
                            onClick={() => setViewMode(false)}
                        >
                            Active
                        </button>
                        <button
                            className={viewMode == true ? CoursesCSS.selected : ""}
                            onClick={() => setViewMode(true)}
                        >
                            History
                        </button>
                    </div>

                    {userRole == 'INSTRUCTOR' && (
                        <div className={CoursesCSS.rightButtons}>
                            <button
                                onClick={handleOpenDialog}>Share
                            </button>

                            <button
                                onClick={handleCrateCourse}>Create course
                            </button>
                        </div>
                    )}
                </div>

                {/* Courses search bar */}
                <div className={CoursesCSS.searchContainer}>
                    <SearchBar
                        data={courses}
                        setResults={setFilteredCourses}
                        type="courses"
                        className={CoursesCSS.smallSearchBar}
                    />
                </div>
            </div>

            {/* List of instructors assigned to the students */}
            {userRole == 'STUDENT' && studentSpec.length > 0 && (
                <div>
                    <label htmlFor="instructorSelect"></label>
                    <select
                        id="instructorSelect"
                        value={selectedInstructor}
                        onChange={(e) => setSelectedInstructor(e.target.value)}
                        className={CoursesCSS.selectDropdown}
                    >
                        <option value="" disabled>Choose instructor</option>
                        {uniqueInstructors.map((instructor) => (
                            <option key={instructor.id} value={instructor.id}>
                                {instructor.firstname} {instructor.lastname}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Custom pagination */}
            <div className={CoursesCSS.pagination}>
                <button
                    disabled={currentPage == 1 || totalPages == 0}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                    Previous
                </button>

                <span>
                    Page {totalPages == 0 ? 0 : currentPage} of {totalPages}
                </span>

                <button
                    disabled={currentPage == totalPages || totalPages == 0}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                    Next
                </button>
            </div>

            {/* Courses list */}
            <div className={CoursesCSS.courseCardContainer}>
                {filteredCourses.length === 0 ? (
                    <p className={CoursesCSS.noDataMessage}>No courses available!</p>
                ) : (
                    currentItems.map((course) => (
                        <div key={course.id} className={CoursesCSS.courseCard}>
                            <div className={CoursesCSS.cardHeader}>
                                <input
                                    type="checkbox"
                                    checked={selectedCourses.includes(course.id)}
                                    onChange={() => handleCheckboxCourses(course.id)}
                                />
                                <h3
                                    className={CoursesCSS.courseTitle}
                                    onClick={() => handleCourseClick(course.id)}
                                >
                                    {course.name}
                                </h3>
                            </div>

                            {/* Courses info */}
                            <div className={CoursesCSS.cardDetails}>
                                <p><strong>Start:</strong> {course.startDate}</p>
                                <p><strong>End:</strong> {course.endDate}</p>
                                <p><strong>Images:</strong> {course.imageCount ?? 0}</p>
                                <p><strong>Videos:</strong> {course.videoCount ?? 0}</p>
                                <p><strong>Spotify track:</strong> {course.hasSpotifyTrack ? "Yes" : "No"}</p>
                            </div>
                            {userRole == "INSTRUCTOR" && (
                                <div className={CoursesCSS.cardActions}>
                                    <button
                                        className={CoursesCSS.deleteButton}
                                        onClick={() => handleDeleteCourse(course.id, token)}
                                    >
                                        <FiTrash size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Send courses to students dialog */}
            <dialog ref={dialogRef} className={ShareDialogCSS.dialogContainer}>
                <h2 className={ShareDialogCSS.dialogTitle}>Students list</h2>

                <div className={ShareDialogCSS.tableContainer}>
                    <DataTable
                        columns={studentColumns}
                        data={students}
                        pagination
                        paginationPerPage={5}
                        customStyles={customStyles}
                        highlightOnHover
                        striped
                    />
                </div>

                <div className={ShareDialogCSS.dialogActions}>
                    <button className={ShareDialogCSS.closeButton} onClick={handleCloseDialog}>
                        Close
                    </button>
                    <button className={ShareDialogCSS.assignButton} onClick={shareStudentsCourses}>
                        Assign
                    </button>
                </div>
            </dialog>
        </div>
    )

}

export default CoursesComponent