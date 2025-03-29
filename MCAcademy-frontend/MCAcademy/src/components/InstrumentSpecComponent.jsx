import DataTable from "react-data-table-component";
import { useState, useEffect } from 'react';

const InstrumentSpecComponent = () => {
  const [selectedInstrument, setSelectedInstrument] = useState("");
  const [instructorId, setInstructorId] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [instruments, setInstruments] = useState([]);

  useEffect(() => {
    const authData = localStorage.getItem("auth");
    const parsedAuth = authData ? JSON.parse(authData) : null;
    const email = parsedAuth?.email || null;

    if (email) {
      findInstructor(email);
    } else {
      console.error("Email is undefined in localStorage!");
    }
  }, []);

  useEffect(() => {
    if (instructorId) {
      findAllSpec(instructorId);
    }
  }, [instructorId]);

  useEffect(() => {
    getAllInstruments();
  }, []);


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
  };


  const handleSelectChange = (event) => {
    setSelectedInstrument(event.target.value);
  };

  const getAllInstruments = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/instructor/instruments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })

      if (response.ok) {
        const data = await response.json();
        console.log(data);

        setInstruments(data);
      }
    } catch (err) {
      console.error("Error:", err);
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

        setSpecializations(data);
      }
    } catch (err) {
      console.error("Eroare:", err);
    }
  }

  const saveSelectedInstrument = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/instructor/assign/${instructorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ instrument: selectedInstrument }),
        withCredentials: true
      })

      if (response.ok) {
        const data = await response.json();
        console.log(data);

        if (instructorId) {
          findAllSpec(instructorId);
        }
      }
    } catch (err) {
      console.error("Eroare:", err);
    }
  }

  const columns = [
    {
      name: "Instrument",
      selector: (row) => row.instrument,
    },
    {
      name: "Time assigned",
      selector: (row) => row.timeAssigned,
    },
  ];

  return (
    <div className="p-4">
      <label htmlFor="instrument" className="block mb-2 text-lg font-semibold">
        Select an instrument:
      </label>
      <select
        id="instrument"
        value={selectedInstrument}
        onChange={handleSelectChange}
        className="border border-gray-300 p-2 rounded-lg w-full"
      >
        <option value="" disabled>Select an instrument</option>
        {instruments.map((instrument) => (
          <option key={instrument} value={instrument}>
            {instrument}
          </option>
        ))}
      </select>

      <button onClick={saveSelectedInstrument}>Save</button>

      <div>
        <DataTable
          title="List of assigned instruments"
          columns={columns}
          data={specializations}
          progressPending={loading}
        />
      </div>

      {selectedInstrument && (
        <p className="mt-4 text-green-600 font-medium">
          You selected: {selectedInstrument}
        </p>
      )}
    </div>
  )
}

export default InstrumentSpecComponent;