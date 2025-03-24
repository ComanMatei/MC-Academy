import DataTable from "react-data-table-component";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

const ListOfUsersComponent = () => {

    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState("ADMIN");

    const [selectedStatus, setSelectedStatus] = useState("PENDING");

    useEffect(() => {
        fetchTableData(role, selectedStatus);
    }, [role, selectedStatus]);

    const fetchTableData = async (userRole, selectedStatus) => {
        setLoading(true);

        console.log("role: " + userRole);
        console.log("status: " + selectedStatus);

        try {
            const response = await fetch(`http://localhost:8080/api/v1/user/${userRole}/${selectedStatus}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);

                setUsers(data);
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
            name: "Status",
            selector: (row) => row.status,
        },
        {
            name: "Profile",
            cell: (row) => (
                <button onClick={() => handleUserProfile(row.id)}>
                    See Profile
                </button>
            ),
        },
    ];

    const handleUserProfile = (userId) => {
        navigate(`/profile/${userId}`);
    }

    const goBack = () => {
        navigate(-1);
    }

    return (
        <div>
            <button onClick={() => setRole("ADMIN")}>Admin</button>
            <button onClick={() => setRole("INSTRUCTOR")}>Instructor</button>
            <button onClick={() => setRole("STUDENT")}>Student</button>

            {/* Select dropdown pentru status */}
            <div>
                <h4>Select users status</h4>
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

            <DataTable
                title="List of locked instructors"
                columns={columns}
                data={users}
                progressPending={loading}
            />
            <button onClick={goBack}>
                Back
            </button>
        </div>
    )
}

export default ListOfUsersComponent;