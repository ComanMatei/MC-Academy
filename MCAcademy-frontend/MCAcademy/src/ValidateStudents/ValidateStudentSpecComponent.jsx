import { useContext, useState, useEffect } from 'react';

import { getInstrInstruments } from "../service/InstructorService";
import { getAssignedStudents } from "../service/InstructorService";
import { validateStudentSpec } from "../service/InstructorService";

import AuthContext from "../context/AuthProvider";
import SearchBar from "../search-bar/SearchBar";

import ValidateStudentsCSS from './validateStudents.module.css'

const ValidateStudentSpecComponent = () => {

    const { auth } = useContext(AuthContext);
    const token = auth?.accessToken;
    const instructorId = auth?.userId;

    const [assignedStudents, setAssignedStudents] = useState([]);
    const [filteredAssignedStudents, setFilteredAssignedStudents] = useState([]);

    const [loading, setLoading] = useState(false);
    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("PENDING");

    const [statusError, setStatusError] = useState('');

    // Instrument emojis for display
    const instrumentEmojis = {
        DRUMS: "🥁",
        GUITAR: "🎸",
        PIANO: "🎹",
        VIOLIN: "🎻",
        FLUTE: "🎶",
    };

    // Pagination fields
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAssignedStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = filteredAssignedStudents.length == 0 ? 0 : Math.ceil(filteredAssignedStudents.length / itemsPerPage);

    // Sets default instrument and return all
    useEffect(() => {
        const fetchInstruments = async (token) => {
            if (instructorId) {
                const instruments = await getInstrInstruments(instructorId, token);
                setInstruments(instruments);
                setSelectedInstrument(instruments[0] || "");
            }
        }
        fetchInstruments(token);
    }, [instructorId]);

    useEffect(() => {
        setStatusError('');
    }, [selectedStatus]);

    useEffect(() => {
        setFilteredAssignedStudents(assignedStudents);
    }, [assignedStudents]);

    useEffect(() => {
        if (instructorId && selectedInstrument) {
            fetchTableData(instructorId, selectedInstrument, selectedStatus);
        }
    }, [instructorId, selectedInstrument, selectedStatus]);

    // Students info
    const fetchTableData = async (instructorId, selectedInstrument, status) => {
        setLoading(true);

        const data = await getAssignedStudents(instructorId, status, selectedInstrument, token);

        const transformedData = data.map(item => ({
            id: item.id,
            firstname: item.firstname,
            lastname: item.lastname,
            description: item.description,
            profilePicture: item.profilePicture,
            age: item.age,
            assignStudentId: item.id
        }));

        setAssignedStudents(transformedData);
        setFilteredAssignedStudents(transformedData)

        setLoading(false);
    };

    // Validate students
    const FetchValidation = async (instructorId, assignStudentId, answer) => {

        try {
            await validateStudentSpec(instructorId, assignStudentId, answer, token);

            setStatusError('')
        } catch (error) {
            const errorMessage = error?.message || 'Validation failed';
            console.error("Error during validation:", errorMessage);
            setStatusError(errorMessage);
        }

        await fetchTableData(instructorId, selectedInstrument, selectedStatus);
    };

    return (
        <div className={ValidateStudentsCSS.wrapper}>

            {/* Instruments button */}
            <div className={ValidateStudentsCSS.instrumentButtons}>
                {instruments.length > 0 ? (
                    instruments.map((instrument, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedInstrument(instrument)}
                            className={`${ValidateStudentsCSS.instrumentButton} ${selectedInstrument === instrument ? ValidateStudentsCSS.selected : ""
                                }`}
                            title={instrument}
                        >
                            {instrumentEmojis[instrument] || "🎵"}
                        </button>
                    ))
                ) : (
                    <p className={ValidateStudentsCSS.noDataMessage}>
                        No instruments are assigned!
                    </p>
                )}
            </div>

            <h2 className={ValidateStudentsCSS.title}>Validate students</h2>

            {/* Status dropdown */}
            <div className={ValidateStudentsCSS.controlsWrapper}>
                <div className={ValidateStudentsCSS.searchWrapper}>
                    <SearchBar
                        data={assignedStudents}
                        setResults={setFilteredAssignedStudents}
                        type="users"
                    />
                </div>

                <div className={ValidateStudentsCSS.statusDropdown}>
                    <select
                        name="status"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="DECLINED">Declined</option>
                    </select>
                </div>
            </div>

            {/* Custom pagination */}
            <div className={ValidateStudentsCSS.pagination}>
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

            {/* Students list */}
            <div className={ValidateStudentsCSS.cardWrapper}>
                {currentItems.length == 0 && !loading && (
                    <div className={ValidateStudentsCSS.noDataMessageWrapper}>
                        <p className={ValidateStudentsCSS.noDataMessage}>
                            No student was found!
                        </p>
                    </div>
                )}

                <div className={ValidateStudentsCSS.cardContainer}>

                    {/* Students information */}
                    {currentItems.map(student => (
                        <div key={student.id} className={ValidateStudentsCSS.studentCard}>

                            {/* Error messages */}
                            {statusError && (
                                <p
                                    className={`${ValidateStudentsCSS.statusError} ${ValidateStudentsCSS.visible}`}
                                    aria-live="assertive"
                                >
                                    {statusError}
                                </p>
                            )}

                            <div className={ValidateStudentsCSS.cardHeader}>
                                {student.firstname} {student.lastname}
                            </div>

                            {student.profilePicture && (
                                <img
                                    src={`data:${student.profilePicture.type};base64,${student.profilePicture.fileData}`}
                                    alt={`${student.firstname} ${student.lastname}`}
                                    className={ValidateStudentsCSS.profileImage}
                                />
                            )}

                            {student.description && (
                                <p className={ValidateStudentsCSS.info}>
                                    <span className={ValidateStudentsCSS.headerTitle}>Description: </span>
                                    <span className={ValidateStudentsCSS.value}>{student.description}</span>
                                </p>
                            )}

                            {student.age && (
                                <p className={ValidateStudentsCSS.info}>
                                    <span className={ValidateStudentsCSS.headerTitle}>Age: </span>
                                    <span className={ValidateStudentsCSS.value}>{student.age}</span>
                                </p>
                            )}

                            {/* Accept/Decline assgin */}
                            <div className={ValidateStudentsCSS.cardButtons}>
                                <button
                                    onClick={() => FetchValidation(instructorId, student.assignStudentId, true)}
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => FetchValidation(instructorId, student.assignStudentId, false)}
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default ValidateStudentSpecComponent;
