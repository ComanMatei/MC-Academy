import { Routes, Route } from 'react-router-dom'

import HomeComponent from './components/HomeComponent'
import RegisterComponent from './Register/RegisterComponent'
import LoginComponent from './LogIn/LoginComponent'
import Layout from './context/Layout'
import AuthLayout from './context/AuthLayout'

import RequireAuth from "./context/RequireAuth";
import AdminComponent from './components/AdminComponent'
import InstructorComponent from './components/InstructorComponent'
import StudentComponent from './components/StudentComponent'

import Unauthorized from './components/Unauthorized'
import UrlUnauthorized from './components/UrlUnauthorized'

import ChangePasswordComponent from './ForgetPassword/ChangePasswordComponent'

import ValidateStudentSpecComponent from './ValidateStudents/ValidateStudentSpecComponent'

import AssignStudentComponent from './AssignStudent/AssignStudentComponent'

import CourseComponent from './CreateCourse/CourseComponent'
import CoursesComponent from './listOfCourses/CoursesComponent'
import SeeCourseComponent from './SeeCourse/SeeCourseComponent'

import ProfileComponent from './Profile/ProfileComponent'
import ListOfUsersComponent from './Users-list/ListOfUsersComponent'

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
        <Route path="/forgotpassword/reset" element={<ChangePasswordComponent />} />
        
        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="url-unauthorized" element={<UrlUnauthorized />} />

        <Route element={<AuthLayout />}>
          {/* ADMIN routes */}
          <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
            <Route path="/admin" element={<AdminComponent />} />
            <Route path="/users" element={<ListOfUsersComponent />} />
          </Route>

          {/* INSTRUCTOR routes */}
          <Route element={<RequireAuth allowedRoles={[ROLES.Instructor]} />}>
            <Route path="instructor" element={<InstructorComponent />} />
            <Route path="/validate-student" element={<ValidateStudentSpecComponent />} />
            <Route path="/create-course" element={<CourseComponent />} />
          </Route>

          {/* STUDENT routes */}
          <Route element={<RequireAuth allowedRoles={[ROLES.Student]} />}>
            <Route path='/assign-spec' element={<AssignStudentComponent />} />
            <Route path='/student' element={<StudentComponent />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={[ROLES.Instructor, ROLES.Student]} />}>
            <Route path="/courses" element={<CoursesComponent />} />
            <Route path="/course/:id" element={<SeeCourseComponent />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={[ROLES.Admin, ROLES.Instructor, ROLES.Student]} />}>
            <Route path="/" element={<HomeComponent />} />
            <Route path="/profile/:id" element={<ProfileComponent />} />
          </Route>

        </Route>

      </Route>
    </Routes>
  )
}

