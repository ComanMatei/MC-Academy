import DataTable from "react-data-table-component";
import SearchBar from "../search-bar/SearchBar";

import { useContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import { getInstrInstruments } from "../service/InstructorService";
import { getAssignedStudents } from "../service/InstructorService";
import { validateStudentSpec } from "../service/InstructorService";

import AuthContext from "../context/AuthProvider";

const ValidateStudentSpecComponent = () => {

    const { auth } = useContext(AuthContext);
    const token = auth?.accessToken;
    const instructorId = auth?.userId;

    const navigate = useNavigate();

    const [assignedStudents, setAssignedStudents] = useState([]);
    const [filteredAssignedStudents, setFilteredAssignedStudents] = useState([]);

    const [loading, setLoading] = useState(false);
    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("PENDING");

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
        setFilteredAssignedStudents(assignedStudents);
    }, [assignedStudents]);

    useEffect(() => {
        if (instructorId && selectedInstrument) {
            fetchTableData(instructorId, selectedInstrument, selectedStatus);
        }
    }, [instructorId, selectedInstrument, selectedStatus]);

    const fetchTableData = async (instructorId, selectedInstrument, status) => {
        setLoading(true);

        const data = await getAssignedStudents(instructorId, status, selectedInstrument, token);

        console.log("Assigned students data:", data);
        const transformedData = data.map(item => ({
            id: item.id,
            firstname: item.firstname,
            lastname: item.lastname,
            assignStudentId: item.id
        }));

        setAssignedStudents(transformedData);
        setFilteredAssignedStudents(transformedData)

        setLoading(false);
    };

    const FetchValidation = async (instructorId, assignStudentId, answer) => {

        console.log("answer", answer);
        await validateStudentSpec(instructorId, assignStudentId, answer, token);

        await fetchTableData(instructorId, selectedInstrument, selectedStatus);
    };

    const columns = [
        { name: "Firstname", selector: (row) => row.firstname },
        { name: "Lastname", selector: (row) => row.lastname },
        {
            name: "Approve",
            cell: (row) => (
                <button onClick={() => FetchValidation(instructorId, row.assignStudentId, true)}>
                    Approve
                </button>
            ),
        },
        {
            name: "Decline",
            cell: (row) => (
                <button onClick={() => FetchValidation(instructorId, row.assignStudentId, false)}>
                    Decline
                </button>
            ),
        },
    ];

    return (
        <div>
            <h2>Assigned students</h2>

            {/* Butoane pentru selectarea instrumentelor */}
            {instruments.length > 0 ? (
                instruments.map((instrument, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedInstrument(instrument)}
                        style={{
                            margin: "5px",
                            backgroundColor: selectedInstrument === instrument ? "lightblue" : "white",
                        }}
                    >
                        {instrument}
                    </button>
                ))
            ) : (
                <p>Nu există instrumente asignate.</p>
            )}

            {/* Select dropdown pentru status */}
            <div>
                <h4>Select students status</h4>
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

            <div className='seach-container'>
                <SearchBar
                    data={assignedStudents}
                    setResults={setFilteredAssignedStudents}
                    type="users"
                />
            </div>

            {/* Students table */}
            <div>
                <DataTable
                    title="List of assigned students"
                    columns={columns}
                    data={filteredAssignedStudents}
                    progressPending={loading}
                />
            </div>
        </div>
    );
};

export default ValidateStudentSpecComponent;
