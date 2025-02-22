import { Routes, Route } from 'react-router-dom'
import HomeComponent from './components/HomeComponent'
import RegisterComponent from './components/RegisterComponent'
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

const ROLES = {
  'Admin': 'ADMIN',
  'Instructor': 'INSTRUCTOR',
  'Student': 'STUDENT'
}


export default function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        {/* public routes */}
        <Route path="register" element={<RegisterComponent />} />
        <Route path="login" element={<LoginComponent />} />
        <Route path="linkpage" element={<LinkPage />} />
        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="/mail-info" element={<MailInformationComponent />} />

        {/* ADMIN routes */}
        <Route element={<RequireAuth allowedRoles={[ROLES.Admin]}/>}>
          <Route path="admin" element={<AdminComponent />} />
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

