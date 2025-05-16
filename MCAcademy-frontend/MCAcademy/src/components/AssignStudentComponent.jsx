import SearchComponent from "../search-bar/SearchComponent";

import { useContext, useState, useEffect } from "react";

import AuthContext from "../context/AuthProvider";

import { listOfUsers } from "../service/UserService";
import { findAllSpec } from "../service/InstructorService";
import { assignStudent } from "../service/StudentService";

const AssignStudentComponent = () => {

    const { auth } = useContext(AuthContext);
    const token = auth?.accessToken;
    const studentId = auth?.userId;

    const [instructors, setInstructors] = useState([]);
    const [selectedInstructor, setSelectedInstructor] = useState("");

    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState("");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchListOfInstructors = async () => {
            setLoading(true);

            const instructors = await listOfUsers("INSTRUCTOR", "APPROVED", token);
            setInstructors(instructors);

            setLoading(false);
        };

        fetchListOfInstructors();
    }, []);

    const handleSelectInstrument = (event) => {
        const instrumentId = event.target.value;
        const selectedInst = instruments.find(inst => inst.id === parseInt(instrumentId));
        setSelectedInstrument(selectedInst);
    };

    const fetchAssignStudent = async () => {
        const assign = {
            instructorSpecId: selectedInstrument.id,
            status: "PENDING",
        };

        await assignStudent(studentId, assign, token);
    }

    return (
        <div className="p-4">
            <label htmlFor="instrument" className="block mb-2 text-lg font-semibold">
                Select your instructor:
            </label>

            <SearchComponent
                instructors={instructors}
                onSelectInstructor={async (instructor) => {
                    console.log("Instructor selected:", instructor);
                    setSelectedInstructor(instructor);
                    if (instructor?.userId) {
                        try {
                            const instrumentList = await findAllSpec(instructor.userId, token);
                            console.log("Received instruments:", instrumentList);
                            setInstruments(instrumentList);
                        } catch (err) {
                            console.error("Error fetching instruments:", err);
                        }
                    }
                }}
            />

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
                value={selectedInstrument?.id || ""}
                onChange={handleSelectInstrument}
                className="border border-gray-300 p-2 rounded-lg w-full disabled:bg-gray-100"
                disabled={instruments.length === 0}
            >
                <option value="" disabled>
                    {instruments.length === 0 ? "No instruments available" : "Select instrument"}
                </option>

                {instruments.map(({ id, instrument, timeAssigned }) => (
                    <option key={id} value={id}>
                        {instrument} {timeAssigned}
                    </option>
                ))}
            </select>

            <button onClick={fetchAssignStudent}>Save</button>

            {selectedInstrument && (
                <p className="mt-4 text-green-600 font-medium">
                    You selected: {selectedInstrument.instrument}
                </p>
            )}

        </div>
    );
}

export default AssignStudentComponent