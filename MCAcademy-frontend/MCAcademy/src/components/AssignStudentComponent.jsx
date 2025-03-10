import { useState, useEffect } from "react";

const AssignStudentComponent = () => {

    const [instructors, setInstructors] = useState([]);
    const [selectedInstructor, setSelectedInstructor] = useState("");

    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState("");

    const [loading, setLoading] = useState(false);
    const [studentId, setStudentId] = useState('');
    const [instructorId, setInstructorId] = useState('')

    useEffect(() => {
        listOfInstructors();
    }, []);

    useEffect(() => {
        const authData = localStorage.getItem("auth");  
        const parsedAuth = authData ? JSON.parse(authData) : null;  
        const email = parsedAuth?.email || null; 

        findStudent(email);
    })

    const handleSelectInstructor = (event) => {
        const instructorId = event.target.value;
        const instructor = instructors.find(inst => inst.id === parseInt(instructorId));
        setSelectedInstructor(instructor);

        if (instructor) {
            findAllSpec(instructorId); // Căutăm instrumentele instructorului selectat
        }
    }

    const handleSelectInstrument = (event) => {
        const instrumentId = event.target.value;  // Trebuie să folosești valoarea
        const selectedInst = instruments.find(inst => inst.id === parseInt(instrumentId));  // Căutăm instrumentul pe baza ID-ului
        setSelectedInstrument(selectedInst); // Setează întregul obiect instrument
    };

    const findStudent = async (email) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/student/${email}`, {
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
            console.log("Student Data:", data); 
            setStudentId(data.id);
    
        } catch (err) {
            console.error("Eroare la fetch:", err);
        }
    };

    const listOfInstructors = async () => {
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/v1/student/approved-instructors', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);

                setInstructors(data);
            } else {
                console.error('Error:', response.status);
            }
        } catch (err) {
            console.error("Eroare:", err);
        } finally {
            setLoading(false);
        }
    }

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
                console.log("aici sefule")
                setInstruments(data);
            } else {
                console.error('Error:', response.status);
            }
        } catch (err) {
            console.error("Eroare:", err);
        }
    }

    const assignStudent = async () => {
        try {
            const assign = {
                instructorSpec: {
                  id: selectedInstrument.id,
                },
                status: "PENDING",
              };

            const response = await fetch(`http://localhost:8080/api/v1/student/assign-spec/${studentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(assign),
                withCredentials: true
            })

            if(response.ok) {
                const data = response.json();
                console.log(data);
            } else {
                console.error('Error:', response.status);
            }
        } catch (err) {
            console.error("Eroare:", err);
        }
    }

    return (
        <div className="p-4">
            <label htmlFor="instrument" className="block mb-2 text-lg font-semibold">
                Select your instructor:
            </label>
            <select
                id="instructor"
                value={selectedInstructor ? selectedInstructor.id : ""}
                onChange={handleSelectInstructor}
                className="border border-gray-300 p-2 rounded-lg w-full"
            >
                <option value="" disabled>Select your instructor</option>
                {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                        {instructor.firstname} {instructor.lastname}
                    </option>
                ))}
            </select>

            {selectedInstructor && (
                <p className="mt-4 text-green-600 font-medium">
                    You selected: {selectedInstructor.firstname} {selectedInstructor.lastname}
                </p>
            )}

            <label htmlFor="instrument" className="block mb-2 text-lg font-semibold">
                Select instrument:
            </label>
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
                        {instrument.instrument} {instrument.timeAssigned} 
                    </option>
                ))}
            </select>

            <button onClick={assignStudent}>Save</button>

            {selectedInstrument && (
                <p className="mt-4 text-green-600 font-medium">
                    You selected: {selectedInstrument.instrument}
                </p>
            )}
        </div>


    );
}

export default AssignStudentComponent