import { Routes, Route } from 'react-router-dom'

import HomeComponent from './components/HomeComponent'
import RegisterComponent from './registerState/RegisterComponent'
import LoginComponent from './components/LoginComponent'
import Layout from './context/Layout'

import RequireAuth from "./components/RequireAuth";
import AdminComponent from './components/AdminComponent'
import InstructorComponent from './components/InstructorComponent'
import StudentComponent from './components/StudentComponent'
import LinkPage from './components/LinkPage'
import Home from './components/Home'
import Unauthorized from './components/Unauthorized'

import MailInformationComponent from './components/MailInformationComponent'
import VerifyEmailComponent from './components/VerifyEmailComponent'
import ChangePasswordComponent from './components/ChangePasswordComponent'

import AdminValidComponent from './components/AdminValidComponent';

const ROLES = {
  'Admin': 'ADMIN',
  'Instructor': 'INSTRUCTOR',
  'Student': 'STUDENT'
}

export default function App() {
  //const [searchParams] = useSearchParams();
  //const confirmToken = searchParams.get("token") || localStorage.getItem("confirmToken");

  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        {/* public routes */}
        <Route path="register" element={<RegisterComponent />} />
        <Route path="login" element={<LoginComponent />} />
        <Route path="verify-email" element={<VerifyEmailComponent />} />
        <Route path="linkpage" element={<LinkPage />} />
        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="mail-info" element={<MailInformationComponent />} />
        <Route path="/forgotpassword/reset" element={<ChangePasswordComponent />} />

        {/* ADMIN routes */}
        <Route element={<RequireAuth allowedRoles={[ROLES.Admin]}/>}>
          <Route path="admin" element={<AdminComponent />} />
          <Route path="validate" element={<AdminValidComponent />} />
        </Route>

        {/* INSTRUCTOR routes */}
        <Route element={<RequireAuth allowedRoles={[ROLES.Instructor]}/>}>
          <Route path="instructor" element={<InstructorComponent />} />
        </Route>

        {/* STUDENT routes */}
        <Route element={<RequireAuth allowedRoles={[ROLES.Student]}/>}>
          <Route path='/student' element={<StudentComponent />} />
        </Route>

        <Route element={<RequireAuth allowedRoles={[ROLES.Admin, ROLES.Instructor, ROLES.Student]}/>}>
          <Route path="/" element={<Home />} />
        </Route>

      </Route>
    </Routes>
  )
}

