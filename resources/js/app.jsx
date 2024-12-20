import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import AllStudents from './components/AllStudents.jsx';
import StudentDetails from './components/StudentDetails.jsx';
import Analytics from './components/Analytics.jsx';
import Requests from './components/Requests.jsx';
import AdminSettings from './components/AdminSettings.jsx';
import ManageUsers from './components/ManageUsers';
import SemesterSettings from './components/SemesterSettings';
import ProgramStructures from './components/ProgramStructures';
import ProtectedRoute from './components/ProtectedRoute';
import ProcessLogin from './components/ProcessLogin';
import AutoLogin from './components/AutoLogin';
import Registration from './components/Registration.jsx';
import RegistrationComplete from './components/RegistrationComplete.jsx';
import StudyPlanRegistration from './components/StudyPlanRegistration.jsx';
import Unauthorized from './components/Unauthorized';
import InternalServerError from './components/InternalServerError';

function App() {
    return (
        <Routes>
            <Route path="/" element={<AutoLogin />} />
            <Route path="/process-login" element={<ProcessLogin />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/internal-server-error" element={<InternalServerError />} />

            {/* Full Page Routes without MainLayout */}
            <Route path="/student/register" element={<ProtectedRoute role="student"><Registration /></ProtectedRoute>} />
            <Route path="/student/register-study-plan" element={<ProtectedRoute role="student"><StudyPlanRegistration /></ProtectedRoute>} />
            <Route path="/student/registration-complete" element={<ProtectedRoute role="student"><RegistrationComplete /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="admin" element={<ProtectedRoute role="admin"><MainLayout /></ProtectedRoute>}>
                <Route path="all-students" element={<AllStudents />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="requests" element={<Requests />} />
                <Route path="admin-settings" element={<AdminSettings />} />
                <Route path="admin-settings/manage-users" element={<ManageUsers />} />
                <Route path="admin-settings/semester-settings" element={<SemesterSettings />} />
                <Route path="admin-settings/program-structures" element={<ProgramStructures />} />
                <Route path="student/:id" element={<StudentDetails />} />
            </Route>

            {/* Lecturer Routes */}
            {/* Handle Lecturer Supervisor */}
            <Route path="lecturer/supervisor" element={<ProtectedRoute role="lecturer_supervisor"><MainLayout /></ProtectedRoute>}>
                <Route path="all-students" element={<AllStudents />} />
                <Route path="student/:id" element={<StudentDetails />} />
                <Route path="requests" element={<Requests />} />
            </Route>

            {/* Handle Lecturer Coordinator */}
            <Route path="lecturer/coordinator" element={<ProtectedRoute role="lecturer_coordinator"><MainLayout /></ProtectedRoute>}>
                <Route path="all-students" element={<AllStudents />} />
                <Route path="student/:id" element={<StudentDetails />} />
                <Route path="analytics" element={<Analytics />} />
            </Route>

            {/* Handle Lecturer with Both Roles */}
            <Route path="lecturer/both" element={<ProtectedRoute role="lecturer_both"><MainLayout /></ProtectedRoute>}>
                <Route path="all-students" element={<AllStudents />} />
                <Route path="student/:id" element={<StudentDetails />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="requests" element={<Requests />} />
            </Route>

            {/* Student Routes */}
            <Route path="student" element={<ProtectedRoute role="student"><MainLayout /></ProtectedRoute>}>
                <Route path="my-progress" element={<StudentDetails />} />
                <Route path="requests" element={<Requests />} />
            </Route>
        </Routes>
    );
}

export default App;
