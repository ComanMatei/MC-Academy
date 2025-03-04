import DataTable from "react-data-table-component";
import { useState, useEffect } from 'react';

const ValidateStudentSpecComponent = () => {

    const [assignedStudents, setAssignedStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [perPage, setPerPage] = useState(10);
    const [instructorId, setInstructorId] = useState('');

    const [instruments, setInstruments] = useState([]);
    const [selectedInstrment, setSelectedInstrument] = useState("");

    useEffect(() => {
        fetchTableData()

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

    const fetchTableData = async (instructorId, selectedInstrument) => {
        setLoading(true);

        console.log("Apelarea pentru instrumentul selectat:", selectedInstrument);
        console.log("Apelarea pentru id:", instructorId);

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
                console.log(data);

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

    const handleValidation = async (instructorId, answer, assignStudentId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/instructor/validation/${instructorId}/${assignStudentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(answer),
                withCredentials: true
            })

            if (response.ok) {
                const data = response.json();
                console.log(data);
                setAssignedStudents(prevStudents =>
                    prevStudents.filter(student => student.assignStudentId !== assignStudentId)
                );
            }
        } catch (err) {
            console.error("Eroare la fetch:", err);
        }
    }

    const columns = [
        {
            name: "Firstname",
            selector: (row) => row.firstname,
        },
        {
            name: "Lastname",
            selector: (row) => row.lastname,
        },
        {
            name: "Unlocking",
            cell: (row) => (
                <button onClick={() => handleValidation(instructorId, true, row.assignStudentId)}>
                    Unlock
                </button>
            ),
        },
        {
            name: "Locking",
            cell: (row) => (
                <button onClick={() => handleValidation(instructorId, false, row.assignStudentId)}>
                    Lock
                </button>
            ),
        },
    ]

    return (
        <div>
            <h2>Assigned students</h2>
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
                    <p>Nu există instrumente asignate.</p>
                )
            }

            <div>
                <DataTable
                    title="List of locked instructors"
                    columns={columns}
                    data={assignedStudents}
                    progressPending={loading}
                />
            </div>
        </div>
    )
}

export default ValidateStudentSpecComponent;