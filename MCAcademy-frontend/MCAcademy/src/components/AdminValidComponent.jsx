import DataTable from "react-data-table-component";
import { useState, useEffect } from 'react';

const AdminValidComponent = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [perPage, setPerPage] = useState(10);
    const [adminId, setAdminId] = useState('');

    useEffect(() => {
        fetchTableData();

        const authData = localStorage.getItem("auth");  
        const parsedAuth = authData ? JSON.parse(authData) : null;  
        const email = parsedAuth?.email || null;  

        findAdmin(email);
    }, []);

    const findAdmin = async (email) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/admin/${email}`, {
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
            console.log("Admin Data:", data); 
            setAdminId(data.id);
    
        } catch (err) {
            console.error("Eroare la fetch:", err);
        }
    };

    const fetchTableData = async () => {
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/v1/admin/lockedinstructors', {
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
    };

    const handleValidation = async (instructorId, answer) => {

        const validationObj = {adminId, instructorId, validation: answer}

        try {
            const response = await fetch(`http://localhost:8080/api/v1/admin/validation/${adminId}/${instructorId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(validationObj),
                withCredentials: true
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);

                setInstructors((prevInstructors) => 
                    prevInstructors.filter(instructor => instructor.id !== instructorId)
                );
            } else {
                console.error('Error:', response.status);
            }
        } catch (err) {
            console.error("Eroare:", err);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            name: "ID",
            selector: (row) => row.id,
        },
        {
            name: "Firstname",
            selector: (row) => row.firstname,
        },
        {
            name: "Lastname",
            selector: (row) => row.lastname,
        },
        {
            name: "Email",
            selector: (row) => row.email,
          },
          {
            name: "Unlocking",
            cell: (row) => (
                <button onClick={() => handleValidation(row.id, true)}>
                    Unlock
                </button>
            ),
          },
          {
            name: "Locking",
            cell: (row) => (
              <button onClick={() => handleValidation(row.id, false)}>
                Lock
              </button>
            ),
          },
    ];

    return (
        <div>
            <DataTable
                title="List of locked instructors"
                columns={columns}
                data={instructors}
                progressPending={loading}
            />
        </div>
    );
};

export default AdminValidComponent;
