import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './components/Login.jsx';
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
import { UserProvider, useUser } from './components/UserContext';

function App() {
    return (
        <UserProvider>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                    <Route path="all-students" element={<AllStudents />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="requests" element={<Requests />} />
                    <Route path="admin-settings" element={<AdminSettings />} />
                    <Route path="admin-settings/manage-users" element={<ManageUsers />} />
                    <Route path="admin-settings/semester-settings" element={<SemesterSettings />} />
                    <Route path="admin-settings/program-structures" element={<ProgramStructures />} />
                    <Route path="student/:id" element={<StudentDetails />} />
                </Route>
            </Routes>
        </UserProvider>
    );
}

export default App;
