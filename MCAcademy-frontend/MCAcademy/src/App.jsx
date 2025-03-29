import { Routes, Route } from 'react-router-dom'

import HomeComponent from './components/HomeComponent'
import RegisterComponent from './registerState/RegisterComponent'
import LoginComponent from './components/LoginComponent'
import Layout from './context/Layout'

import RequireAuth from "./components/RequireAuth";
import AdminComponent from './components/AdminComponent'
import InstructorComponent from './components/InstructorComponent'
import StudentComponent from './components/StudentComponent'
import Unauthorized from './components/Unauthorized'

import MailInformationComponent from './components/MailInformationComponent'
import VerifyEmailComponent from './components/VerifyEmailComponent'
import ChangePasswordComponent from './components/ChangePasswordComponent'

import InstrumentSpecComponent from './components/InstrumentSpecComponent'
import ValidateStudentSpecComponent from './components/ValidateStudentSpecComponent'

import AssignStudentComponent from './components/AssignStudentComponent'

import SpotifySearch from './components/SpotifySearch'
import CourseComponent from './course/CourseComponent'
import CoursesComponent from './listOfCourses/CoursesComponent'
import SeeCourseComponent from './course/SeeCourseComponent'

import ProfileComponent from './components/ProfileComponent'
import ListOfUsersComponent from './components/ListOfUsersComponent'

import SearchComponent from './search-bar/SearchComponent'


import { InstrumentProvider } from "./context/InstrumentContext";

const ROLES = {
  'Admin': 'ADMIN',
  'Instructor': 'INSTRUCTOR',
  'Student': 'STUDENT'
}

export default function App() {

  return (
    <InstrumentProvider>
      <Routes>
        <Route path='/' element={<Layout />}>
          {/* public routes */}
          <Route path="register" element={<RegisterComponent />} />
          <Route path="login" element={<LoginComponent />} />
          <Route path="verify-email" element={<VerifyEmailComponent />} />
          <Route path="unauthorized" element={<Unauthorized />} />
          <Route path="mail-info" element={<MailInformationComponent />} />
          <Route path="/forgotpassword/reset" element={<ChangePasswordComponent />} />
          <Route path="/search" element={<SpotifySearch />} />
          <Route path="/course/:id" element={<SeeCourseComponent />} />

          <Route path='/searchbar' element={<SearchComponent />} />

          <Route path="/profile/:id" element={<ProfileComponent />} />

          {/* ADMIN routes */}
          <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
            <Route path="admin" element={<AdminComponent />} />
            <Route path="/users" element={<ListOfUsersComponent />} />
          </Route>

          {/* INSTRUCTOR routes */}
          <Route element={<RequireAuth allowedRoles={[ROLES.Instructor]} />}>
            <Route path="instructor" element={<InstructorComponent />} />
            <Route path="/assign-instrument" element={<InstrumentSpecComponent />} />
            <Route path="/validate-student" element={<ValidateStudentSpecComponent />} />
            <Route path="/course" element={<CourseComponent />} />
          </Route>

          {/* STUDENT routes */}
          <Route element={<RequireAuth allowedRoles={[ROLES.Student]} />}>
            <Route path='/assign-spec' element={<AssignStudentComponent />} />
            <Route path='/student' element={<StudentComponent />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={[ROLES.Admin, ROLES.Instructor, ROLES.Student]} />}>
            <Route path="/" element={<HomeComponent />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={[ROLES.Instructor, ROLES.Student]} />}>
            <Route path="/courses" element={<CoursesComponent />} />
          </Route>

        </Route>
      </Routes>
    </InstrumentProvider>
  )
}

