import { useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import AuthContext from "../context/AuthProvider";

import InstrumentSpecDialog from "../InstrInstrument/InstrumentSpecDialog";

import Header from "../header/Header";

import HomeCSS from './home.module.css';

import drumsCourse from './images/drums_course.jpg';
import guitarCourse from './images/guitar_course.jpg';
import guitarCourse1 from './images/guitar_course1.jpg';
import pianoCourse from './images/piano_course.jpg';
import pianoCourse1 from './images/piano_course1.jpg';
import violinCourse from './images/violin_course.jpg';

const HomeComponent = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const userId = auth?.userId;
    const roles = auth?.roles || [];

    const location = useLocation();

    const [showDialog, setShowDialog] = useState(false);

    const sliderRef = useRef(null);
    const numSlides = 6;
    const intervalTime = 3000;

    useEffect(() => {
        if (location.state?.openDialog) {
            setShowDialog(true);

            navigate(location.pathname, { replace: true });
        }
    }, [location.state, navigate, location.pathname]);

    useEffect(() => {
        let currentIndex = 0;

        const interval = setInterval(() => {
            if (sliderRef.current) {
                currentIndex = (currentIndex + 1) % numSlides;
                sliderRef.current.scrollTo({
                    left: sliderRef.current.clientWidth * currentIndex,
                    behavior: "smooth"
                });
            }
        }, intervalTime);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={HomeCSS.wrapper}>
            <div className={HomeCSS.nav}>
                <Header roles={roles} userId={userId} onOpenDialog={() => setShowDialog(true)} />

                <h2 className={HomeCSS.title}>MC Academy</h2>

                <p className={HomeCSS.tagline}>
                    Discover our interactive music courses guided by specialized instructors, ideal for all ages and experience levels.
                </p>

                <div className={HomeCSS.sliderWrapper}>
                    <div className={HomeCSS.slider} ref={sliderRef}>
                        <img src={drumsCourse} alt="img2" />
                        <img src={pianoCourse} alt="img1" />
                        <img src={guitarCourse} alt="img3" />
                        <img src={guitarCourse1} alt="img4" />
                        <img src={pianoCourse1} alt="img5" />
                        <img src={violinCourse} alt="img6" />
                    </div>
                </div>

                <InstrumentSpecDialog
                    isOpen={showDialog}
                    onClose={() => setShowDialog(false)}
                />
            </div>
        </div>
    );
}

export default HomeComponent