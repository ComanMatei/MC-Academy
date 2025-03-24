import DataTable from "react-data-table-component";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import { useInstrument } from "../context/InstrumentContext";

const ValidateStudentSpecComponent = () => {
    
    const navigate = useNavigate();
    const { setInstrument } = useInstrument();

    const [assignedStudents, setAssignedStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [instructorId, setInstructorId] = useState('');
    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("PENDING");

    useEffect(() => {
        const authData = localStorage.getItem("auth");
        const parsedAuth = authData ? JSON.parse(authData) : null;
        const email = parsedAuth?.email || null;

        findInstructor(email);
    }, []);

    useEffect(() => {
        if (instructorId) {
            getInstrInstruments(instructorId);
        }
    }, [instructorId]);

    useEffect(() => {
        if (instructorId && selectedInstrument) {
            fetchTableData(instructorId, selectedInstrument, selectedStatus);
        }
    }, [instructorId, selectedInstrument, selectedStatus]);

    const findInstructor = async (email) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/instructor/${email}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            setInstructorId(data.id);
        } catch (err) {
            console.error("Eroare la fetch:", err);
        }
    };

    const fetchTableData = async (instructorId, selectedInstrument, status) => {
        setLoading(true);

        try {
            const response = await fetch(`http://localhost:8080/api/v1/instructor/assigning/${instructorId}/${status}?instrument=${selectedInstrument}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });

            if (response.ok) {
                const data = await response.json();
                const transformedData = data.map(item => ({
                    id: item.student.id,
                    firstname: item.student.firstname,
                    lastname: item.student.lastname,
                    assignStudentId: item.id
                }));

                setAssignedStudents(transformedData);
            } else {
                console.error('Error:', response.status);
            }
        } catch (err) {
            console.error("Eroare:", err);
        } finally {
            setLoading(false);
        }
    };

    const getInstrInstruments = async (instructorId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/instructor/instruments/${instructorId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });

            if (response.ok) {
                const data = await response.json();
                setInstruments(data);
                setSelectedInstrument(data[0] || "");
            }
        } catch (err) {
            console.error("Eroare la fetch:", err);
        }
    };

    const handleUserProfile = (userId, selectedInstrument) => {
        setInstrument(selectedInstrument);
        navigate(`/profile/${userId}`);
    }

    const columns = [
        { name: "Firstname", selector: (row) => row.firstname },
        { name: "Lastname", selector: (row) => row.lastname },
        {
            name: "Profile",
            cell: (row) => (
                <button onClick={() => handleUserProfile(row.id, selectedInstrument)}>
                    See Profile
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

            {/* Tabelul cu studenții */}
            <div>
                <DataTable
                    title="List of assigned students"
                    columns={columns}
                    data={assignedStudents}
                    progressPending={loading}
                />
            </div>
        </div>
    );
};

export default ValidateStudentSpecComponent;
