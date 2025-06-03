import { useContext, useState, useEffect } from "react";

import { assignStudent } from "../service/StudentService";
import { instructorSpecs } from "../service/StudentService";
import { getAllInstruments } from "../service/UserService";

import AuthContext from "../context/AuthProvider";
import SearchBar from "../search-bar/SearchBar";

import AssignStudentCSS from './assignStudent.module.css';

const AssignStudentComponent = () => {

    const { auth } = useContext(AuthContext);
    const token = auth?.accessToken;
    const studentId = auth?.userId;

    const [instructors, setInstructors] = useState([]);

    const [filteredinstructors, setFilteredInstructors] = useState([]);

    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState("");

    const [loading, setLoading] = useState(false);

    // Error/Succes validation field
    const [assignStatus, setAssignStatus] = useState({});

    // Pagination fields
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredinstructors.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = filteredinstructors.length == 0 ? 0 : Math.ceil(filteredinstructors.length / itemsPerPage);

    // Returns all instruments
    useEffect(() => {
        const fetchInstruments = async () => {
            try {
                const instrumentsData = await getAllInstruments(token);
                setInstruments(instrumentsData);
            } catch (error) {
                console.error("Error fetching instruments:", error);
            }
        };

        fetchInstruments();
    }, [token]);

    const fetchAssignStudent = async (instructorSpecId) => {
        const assign = {
            instructorSpecId,
            status: "PENDING",
        };

        try {
            await assignStudent(studentId, assign, token);
            setAssignStatus(prev => ({
                ...prev,
                [instructorSpecId]: { success: "Successfully assigned!", error: "" }
            }));
        } catch (err) {
            let errorMessage = "";
            if (err.status === 400) {
                errorMessage = err.message || "Invalid request.";
            }
            setAssignStatus(prev => ({
                ...prev,
                [instructorSpecId]: { success: "", error: errorMessage }
            }));
        }
    };

    const handleSelectChange = (event) => {
        const instrument = event.target.value;

        setSelectedInstrument(instrument);
        setFilteredInstructors([]);
        fetchTableData(instrument);
    };

    // Instructors info
    const fetchTableData = async (selectedInstrument) => {
        setLoading(true);

        const data = await instructorSpecs(studentId, selectedInstrument, token);

        const transformedData = data.map(item => ({
            id: item.id,
            firstname: item.firstname,
            lastname: item.lastname,
            description: item.description,
            profilePicture: item.profilePicture,
            timeAssigned: item.timeAssigned,
            age: item.age
        }));

        setFilteredInstructors(transformedData)
        setInstructors(transformedData);

        setLoading(false);
    };

    return (
        <div className={AssignStudentCSS.wrapper}>

            <h2 className={AssignStudentCSS.title}>Assign instructor</h2>

            {/* Dropdown with all the instruments */}
            <div className={AssignStudentCSS.verticalGroup}>
                <label htmlFor="instrument" className={AssignStudentCSS.label}>
                    Select an instrument first
                </label>
                <select
                    id="instrument"
                    value={selectedInstrument}
                    onChange={handleSelectChange}
                    className={AssignStudentCSS.select}
                >
                    <option value="" disabled>Instruments</option>
                    {instruments.map((instrument) => (
                        <option key={instrument} value={instrument}>
                            {instrument}
                        </option>
                    ))}
                </select>
            </div>

            {/* Search bar for instructors */}
            <div className={AssignStudentCSS.searchWrapper}>
                <SearchBar
                    data={instructors}
                    setResults={setFilteredInstructors}
                    type="users"
                />
            </div>

            {/* Custom pagination */}
            <div className={AssignStudentCSS.pagination}>
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

            {/* Instructors list */}
            <div className={AssignStudentCSS.cardWrapper}>
                {selectedInstrument && currentItems.length == 0 && !loading && (
                    <div className={AssignStudentCSS.noDataMessageWrapper}>
                        <p className={AssignStudentCSS.noDataMessage}>
                            No instructors are assigned to this instrument!
                        </p>
                    </div>
                )}

                <div className={AssignStudentCSS.cardContainer}>

                    {/* Instructors information */}
                    {selectedInstrument && currentItems.length > 0 && (
                        <div className={AssignStudentCSS.cardContainer}>
                            {currentItems.map((instructor, index) => (
                                <div key={instructor.id || index} className={AssignStudentCSS.instructorCard}>

                                    {/* Error messages */}
                                    {assignStatus[instructor.id]?.error && (
                                        <p className={AssignStudentCSS.errmsg} aria-live="assertive">
                                            {assignStatus[instructor.id].error}
                                        </p>
                                    )}

                                    {/* Success message specific to this instructor */}
                                    {assignStatus[instructor.id]?.success && (
                                        <p className={AssignStudentCSS.successmsg} aria-live="polite">
                                            {assignStatus[instructor.id].success}
                                        </p>
                                    )}

                                    <div className={AssignStudentCSS.cardHeader}>
                                        {instructor.firstname} {instructor.lastname}
                                    </div>

                                    {instructor.profilePicture && (
                                        <img
                                            src={`data:${instructor.profilePicture.type};base64,${instructor.profilePicture.fileData}`}
                                            alt={`${instructor.firstname} ${instructor.lastname}`}
                                            className={AssignStudentCSS.profileImage}
                                        />
                                    )}

                                    {instructor.description && (
                                        <p className={AssignStudentCSS.profileInfo}>
                                            <span className={AssignStudentCSS.profileTitle}>Description:</span> {instructor.description}
                                        </p>
                                    )}

                                    {instructor.description && (
                                        <p className={AssignStudentCSS.profileInfo}>
                                            <span className={AssignStudentCSS.profileTitle}>Age:</span> {instructor.age}
                                        </p>
                                    )}

                                    {instructor.description && (
                                        <p className={AssignStudentCSS.profileInfo}>
                                            <span className={AssignStudentCSS.profileTitle}>Instructor since:</span> {instructor.timeAssigned}
                                        </p>
                                    )}

                                    <div className={AssignStudentCSS.cardButtons}>
                                        <button
                                            onClick={() => {
                                                fetchAssignStudent(instructor.id);
                                            }}
                                        >
                                            Select
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}

export default AssignStudentComponent