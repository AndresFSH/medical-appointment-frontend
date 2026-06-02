import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';

import Sidebar from './components/layout/SideBar.jsx';
import TopBar from './components/layout/TopBar.jsx';
import Toast from './components/ui/Toast.jsx';

import AppointmentPage from './pages/AppointmentPage.jsx';
import PatientPage from './pages/PatientPage.jsx';
import SpecialtyPage from './pages/SpecialtyPage.jsx';
import DoctorPage from './pages/DoctorPage.jsx';
import OfficePage from './pages/OfficePage.jsx';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className='app-layout'>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuClick={() => setSidebarOpen(o => !o)} />
      <main className='main-content'>
        <Routes>
          <Route path="/appointments" element={<AppointmentPage />} />
          <Route path="/patients" element={<PatientPage />} />
          <Route path="/specialties" element={<SpecialtyPage />} />
          <Route path="/doctors" element={<DoctorPage />} />
          <Route path="/offices" element={<OfficePage />} />
          <Route path="*" element={<Navigate to="/appointments" />} />
        </Routes>
      </main>
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AppProvider>
  )
}
