import DataTable from "react-data-table-component";
import SearchBar from "../search-bar/SearchBar";

import { useContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import AuthContext from "../context/AuthProvider";
import { listOfUsers } from "../service/UserService";

const ListOfUsersComponent = () => {

    const { auth } = useContext(AuthContext);
    const token = auth?.accessToken;

    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState("ADMIN");

    const [selectedStatus, setSelectedStatus] = useState("PENDING");

    useEffect(() => {
        const fetchTableData = async () => {
            setLoading(true);

            const users = await listOfUsers(role, selectedStatus, token);
            setUsers(users);
            setFilteredUsers(users);

            setLoading(false);
        }

        fetchTableData();
    }, [role, selectedStatus]);

    useEffect(() => {
        setFilteredUsers(users);
    }, [users]);

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
                <button onClick={() => handleUserProfile(row.userId)}>
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

            <div className='seach-container'>
                <SearchBar
                    data={users}
                    setResults={setFilteredUsers}
                    type = "users"
                />
            </div>

            <DataTable
                title="List of locked instructors"
                columns={columns}
                data={filteredUsers}
                progressPending={loading}
            />
            <button onClick={goBack}>
                Back
            </button>
        </div>
    )
}

export default ListOfUsersComponent;