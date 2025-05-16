import DataTable from "react-data-table-component";
import { useContext, useState, useEffect } from 'react';

import { getAllInstruments } from "../service/InstructorService";
import { findAllSpec } from "../service/InstructorService";
import { saveSelectedInstrument } from "../service/InstructorService";

import AuthContext from "../context/AuthProvider";

const InstrumentSpecComponent = () => {
  const { auth } = useContext(AuthContext);
  const token = auth?.accessToken;
  const userId = auth?.userId;

  const [selectedInstrument, setSelectedInstrument] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [instruments, setInstruments] = useState([]);

  useEffect(() => {
    const fetchInstruments = async () => {
      if (userId) {
        const instrumentsData = await getAllInstruments(token);
        setInstruments(instrumentsData);

        const specializations = await findAllSpec(userId, token);
        setSpecializations(specializations);
      }
    };
    fetchInstruments();
  }, [userId]);

  const handleSelectChange = (event) => {
    setSelectedInstrument(event.target.value);
  };

  const createSpecialization = async (selectedInstrument) => {
    await saveSelectedInstrument(selectedInstrument, userId, token);
    
    const updatedSpecializations = await findAllSpec(userId, token);
    setSpecializations(updatedSpecializations);
  };

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

      <button onClick={() => createSpecialization(selectedInstrument)}>Save</button>

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