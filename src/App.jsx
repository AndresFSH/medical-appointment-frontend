import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/Home/HomePage'
import AppointmentsListPage from './pages/Appointments/AppointmentsListPage'
import AppointmentDetailPage from './pages/Appointments/AppointmentDetailPage'
import CreateAppointmentPage from './pages/Appointments/CreateAppointmentPage'
import DoctorsListPage from './pages/Doctors/DoctorsListPage'
import DoctorDetailPage from './pages/Doctors/DoctorDetailPage'
import CreateDoctorPage from './pages/Doctors/CreateDoctorPage'
import PatientsListPage from './pages/Patients/PatientsListPage'
import PatientDetailPage from './pages/Patients/PatientDetailPage'
import CreatePatientPage from './pages/Patients/CreatePatientPage'
import OfficesListPage from './pages/Offices/OfficesListPage'
import CreateOfficePage from './pages/Offices/CreateOfficePage'
import AppointmentTypesPage from './pages/AppointmentTypes/AppointmentTypesPage'
import CreateAppointmentTypePage from './pages/AppointmentTypes/CreateAppointmentTypePage'
import ReportsPage from './pages/Reports/ReportsPage'

export default function App(){
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/appointments" element={<AppointmentsListPage/>} />
        <Route path="/appointments/new" element={<CreateAppointmentPage/>} />
        <Route path="/appointments/:id" element={<AppointmentDetailPage/>} />
        <Route path="/doctors" element={<DoctorsListPage/>} />
        <Route path="/doctors/new" element={<CreateDoctorPage/>} />
        <Route path="/doctors/:id" element={<DoctorDetailPage/>} />
        <Route path="/patients" element={<PatientsListPage/>} />
        <Route path="/patients/new" element={<CreatePatientPage/>} />
        <Route path="/patients/:id" element={<PatientDetailPage/>} />
        <Route path="/offices" element={<OfficesListPage/>} />
        <Route path="/offices/new" element={<CreateOfficePage/>} />
        <Route path="/appointment-types" element={<AppointmentTypesPage/>} />
        <Route path="/appointment-types/new" element={<CreateAppointmentTypePage/>} />
        <Route path="/reports" element={<ReportsPage/>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  )
}
