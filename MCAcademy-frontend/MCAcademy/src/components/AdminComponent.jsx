import { useNavigate} from "react-router-dom";

const AdminComponent = () => {

    const navigate = useNavigate();

    const validateInstructorsPage = () => {
        navigate('/validate-instr')
    }

    return (
        <section>
            <button onClick={validateInstructorsPage}>Instructor validation</button>
            <button>List of all users</button>
            <button>Back to menu</button>
        </section>
    )
}

export default AdminComponent;