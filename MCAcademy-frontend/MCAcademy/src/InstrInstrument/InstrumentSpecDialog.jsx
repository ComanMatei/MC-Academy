import { useContext, useState, useEffect, useRef } from "react";

import { findAllSpec, saveSelectedInstrument } from "../service/InstructorService";
import { getAllInstruments } from "../service/UserService";

import DataTable from "react-data-table-component";
import AuthContext from "../context/AuthProvider";

import InstrInstrumentCSS from './instrInstrument.module.css'

const InstrumentSpecDialog = ({ isOpen, onClose }) => {
  const { auth } = useContext(AuthContext);
  const token = auth?.accessToken;
  const userId = auth?.userId;

  const dialogRef = useRef(null);
  const errRef = useRef();

  // State variables for managing the selected instrument and list of specializations
  const [selectedInstrument, setSelectedInstrument] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [instruments, setInstruments] = useState([]);

  const [errMsg, setErrMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Instrument emojis mapping
  const instrumentEmojis = {
    DRUMS: "🥁",
    GUITAR: "🎸",
    PIANO: "🎹",
    VIOLIN: "🎻",
    FLUTE: "🎶",
  };

  // Open/Close dialog based on isOpen prop
  useEffect(() => {
    if (dialogRef.current) {
      try {
        if (isOpen && !dialogRef.current.open) {
          dialogRef.current.showModal();
        } else if (!isOpen && dialogRef.current.open) {
          dialogRef.current.close();
        }
      } catch (error) {
        console.error("Dialog error:", error);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setErrMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  // Returns instruments and instructor spec
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !userId) return;

      try {
        const instrumentsData = await getAllInstruments(token);
        setInstruments(instrumentsData);

        const specs = await findAllSpec(userId, token);
        setSpecializations(specs);
      } catch (err) {
        console.error("Eroare la fetch:", err);
      }
    };

    fetchData();
  }, [isOpen, userId]);

  const handleSelectChange = (event) => {
    setSelectedInstrument(event.target.value);
  };

  // Asign instrument to instructor
  const createSpecialization = async () => {
    if (!selectedInstrument) return;

    try {
      const response = await saveSelectedInstrument(selectedInstrument, userId, token);

      if (response.ok) {
        setSuccessMsg("Successfully assigned!");
        setErrMsg('');
      } else {
        let errorData = null;
        try {
          errorData = await response.json();
          setErrMsg(errorData?.message || "Something went wrong");
        } catch (e) {
          setErrMsg("Server error");
        }
        setSuccessMsg('');
        errRef.current?.focus();
      }

      const updatedSpecializations = await findAllSpec(userId, token);
      setSpecializations(updatedSpecializations);
      setSelectedInstrument("");
    } catch (e) {
      console.error("Unexpected error:", e);
      errRef.current?.focus();
    }
  };

  const columns = [
    { name: "Instrument", selector: (row) => row.instrument },
    { name: "Time assigned", selector: (row) => row.timeAssigned },
  ];

  // DataTable design
  const customStyles = {
    tableWrapper: {
      style: {
        marginTop: '0.1rem',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        padding: '1rem',
        maxWidth: '450px',
        marginLeft: 'auto',
        marginRight: 'auto',
        overflowX: 'auto',
        border: '1px solid #ddd',
      }
    },
    title: {
      style: {
        textAlign: 'center',
        fontWeight: '700',
        fontSize: '1.25rem',
        paddingBottom: '0.75rem',
      }
    },
    headRow: {
      style: {
        backgroundColor: '#2563eb',
        borderRadius: '10px 10px 0 0',
      }
    },
    headCells: {
      style: {
        color: 'white',
        fontWeight: '800',
        paddingLeft: '15px',
        paddingRight: '15px',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize: '1rem',
      }
    },
    rows: {
      style: {
        backgroundColor: '#c3d6d9',
        color: '#000000',
        fontSize: '0.875rem',
        borderRadius: '8px',
        marginBottom: '12px',
        cursor: 'default',
        borderBottom: '1px solid #ddd',
        fontWeight: '600',
      },
      highlightOnHoverStyle: {
        backgroundColor: '#e0e7ff',
        transition: 'background-color 0.3s ease',
        cursor: 'pointer',
      }
    },
    cells: {
      style: {
        paddingLeft: '15px',
        paddingRight: '15px',
        justifyContent: 'center',
        textAlign: 'center',
      }
    }
  };

  return (
    <dialog ref={dialogRef} className={InstrInstrumentCSS.dialog}>

      {/* Error messages */}
      <p ref={errRef} className={errMsg ? InstrInstrumentCSS.errmsg : InstrInstrumentCSS.offscreen} aria-live="assertive">
        {errMsg}
      </p>

      {/* Success message */}
      {successMsg && (
        <p className={InstrInstrumentCSS.successmsg} aria-live="polite">
          {successMsg}
        </p>
      )}

      <h2 className={InstrInstrumentCSS.title}>Assign instrument</h2>

      {/* Dropdown with all the instruments */}
      <label htmlFor="instrument" className={InstrInstrumentCSS.label}>
        Select an instrument
      </label>
      <select
        id="instrument"
        value={selectedInstrument}
        onChange={handleSelectChange}
        className={InstrInstrumentCSS.select}
      >
        <option value="" disabled>Instruments</option>
        {instruments.map((instrument) => {
          const emoji = instrumentEmojis[instrument.toUpperCase()] || "";
          return (
            <option key={instrument} value={instrument}>
              {emoji} {instrument}
            </option>
          );
        })}
      </select>

      <button
        onClick={createSpecialization}
        className={InstrInstrumentCSS.saveButton}
      >
        Save
      </button>

      {/* DataTable of assigned instruments */}
      <div className={InstrInstrumentCSS.tableWrapper}>
        <DataTable
          columns={columns}
          data={specializations}
          customStyles={customStyles}
        />
      </div>

      <div className="mt-4 text-right">
        <button
          onClick={() => {
            onClose();
            setSelectedInstrument("");
          }}
          className={InstrInstrumentCSS.closeButton}
        >
          Close
        </button>
      </div>
    </dialog>
  );
};

export default InstrumentSpecDialog;
