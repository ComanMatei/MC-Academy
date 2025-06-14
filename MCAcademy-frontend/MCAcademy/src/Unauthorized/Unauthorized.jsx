import { useNavigate } from "react-router-dom"

import UnauthorizedCSS from './unauthorized.module.css'

const Unauthorized = () => {
    const navigate = useNavigate();

    const goBack = () => navigate('/');

    return (
        <div className={UnauthorizedCSS.wrapper}>
            <section className={UnauthorizedCSS.section}>
                <h1>Unauthorized</h1>
                <br />
                <p>You do not have access to this page!</p>
                <div className={UnauthorizedCSS.flexGrow}>
                    <button onClick={goBack} className={UnauthorizedCSS.button}>Main menu</button>
                </div>
            </section>
        </div>
    );
}

export default Unauthorized