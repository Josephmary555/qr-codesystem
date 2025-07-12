import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from 'components/Header';
import Dashboard from 'components/Dashboard';
import AdminRegister from './AdminRegister';
import EventDetail from './EventDetail';
import EventCreate from 'components/EventCreate';
import UserImport from 'components/UserImport';
import QRCodeGenerator from 'components/QRCodeGenerator';
import QRCodeScanner from 'components/QRCodeScanner';
import CardDesigner from 'components/CardDesigner';
import ReportGenerator from 'components/ReportGenerator';
import NotificationStatus from 'components/NotificationStatus';

const Admin = () => {
  // The role is still needed for role-specific routes inside the admin panel
  const role = localStorage.getItem('role');

  // No need for authentication checks here anymore!
  // The ProtectedRoute component handles that, making this component cleaner.

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {role === 'super_admin' && (
            <Route path="/register-admin" element={<AdminRegister />} />
          )}
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/create-event" element={<EventCreate />} />
          <Route path="/import-users" element={<UserImport />} />
          <Route path="/generate-qr" element={<QRCodeGenerator />} />
          <Route path="/scan-qr" element={<QRCodeScanner />} />
          <Route path="/design-card" element={<CardDesigner />} />
          <Route path="/reports" element={<ReportGenerator />} />
          <Route path="/notifications" element={<NotificationStatus />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;