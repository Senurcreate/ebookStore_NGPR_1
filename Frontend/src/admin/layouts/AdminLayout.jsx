import React from 'react';
import Sidebar from '../components/Sidebar';
import AdminNavbar from '../components/AdminNavbar';

const AdminLayout = ({ children }) => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Sidebar  */}
      <div style={{ width: '250px', borderRight: '1px solid #dee2e6', backgroundColor: '#fff' }}>
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1">
        <AdminNavbar />
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;