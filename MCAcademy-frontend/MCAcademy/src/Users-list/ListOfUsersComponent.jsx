import { useContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import DataTable from "react-data-table-component";
import SearchBar from "../search-bar/SearchBar";
import AuthContext from "../context/AuthProvider";

import { listOfUsers } from "../service/UserService";

import UsersListCSS from './usersList.module.css';
import { FaUser } from 'react-icons/fa';

const ListOfUsersComponent = () => {

    const { auth } = useContext(AuthContext);
    const token = auth?.accessToken;

    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    // Default setup for DataTable
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState("INSTRUCTOR");
    const [selectedStatus, setSelectedStatus] = useState("PENDING");

    // Get users by selected status
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

    // Filter the users from the search bar
    useEffect(() => {
        setFilteredUsers(users);
    }, [users]);

    // Colums for DataTable
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
                <FaUser
                    style={{ cursor: 'pointer', color: '#0b1b77' }}
                    onClick={() => handleUserProfile(row.userId)}
                    title="See Profile"
                    size={20}
                />
            ),
        }
    ];

    const handleUserProfile = (userId) => {
        navigate(`/profile/${userId}`);
    }

    // Customization DataTable
    const customStyles = {
        tableWrapper: {
            style: {
                maxWidth: '80%',
                margin: '20px auto',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 3.1)',
                backgroundColor: '#fff',
                padding: '20px 20px 0px 20px',
                marginBottom: '0px',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
            }
        },
        table: {
            style: {
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: 0,
                paddingBottom: 0,
            }
        },
        headRow: {
            style: {
                backgroundColor: '#0b1b77',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 700,
                textTransform: 'uppercase',
            }
        },
        rows: {
            style: {
                fontSize: '14px',
                borderBottom: '1px solid #e5e7eb',
                '&:hover': {
                    backgroundColor: '#f3f4f6',
                    cursor: 'pointer',
                },
                '&:last-child': {
                    borderBottom: 'none',
                    marginBottom: 0,
                    paddingBottom: 0,
                }
            }
        },
        pagination: {
            style: {
                borderTop: '1px solid #e5e7eb',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 3.1)',
                marginTop: 0,
                paddingTop: '10px',
                paddingBottom: '10px',
                display: 'flex',
                justifyContent: 'right',
                width: '83.2%',             
                margin: '0 auto',
                boxSizing: 'border-box',
            }
        },
        cells: {
            style: {
                justifyContent: 'center',
                textAlign: 'center',
            },
        },
        headCells: {
            style: {
                justifyContent: 'center',
                textAlign: 'center',
            },
        },
    };

    return (
        <div className={UsersListCSS.wrapper}>
            <h4 className={UsersListCSS.title}>List of users</h4>

            <div className={UsersListCSS.controlsWrapper}>

                {/* Search bar */}
                <div className={UsersListCSS.leftControls}>
                    <div className={UsersListCSS.searchWrapper}>
                        <SearchBar
                            data={users}
                            setResults={setFilteredUsers}
                            type="users"
                        />
                    </div>

                    {/* Status dropdown */}
                    <select
                        name="status"
                        value={selectedStatus}
                        className={UsersListCSS.dropdown}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="DECLINED">Declined</option>
                    </select>
                </div>

                {/* Role buttons */}
                <div className={UsersListCSS.rightButtons}>
                    <button
                        className={role == "ADMIN" ? UsersListCSS.active : ""}
                        onClick={() => setRole("ADMIN")}
                    >
                        Admin
                    </button>
                    <button
                        className={role == "INSTRUCTOR" ? UsersListCSS.active : ""}
                        onClick={() => setRole("INSTRUCTOR")}
                    >
                        Instructor
                    </button>
                    <button
                        className={role == "STUDENT" ? UsersListCSS.active : ""}
                        onClick={() => setRole("STUDENT")}
                    >
                        Student
                    </button>
                </div>
            </div>

            {/* Users table */}
            <div className={UsersListCSS.tableSection}>
                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    progressPending={loading}
                    pagination
                    paginationPerPage={5}
                    highlightOnHover
                    striped
                    customStyles={customStyles}
                    className={UsersListCSS.dataTable}
                />
            </div>
        </div>
    );

}

export default ListOfUsersComponent;