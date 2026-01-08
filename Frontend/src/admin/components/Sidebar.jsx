import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: 'bi-grid' , path: '/admin/dashboard'},
    { name: 'Books', icon: 'bi-book' , path: '/admin/books'},
    { name: 'Orders', icon: 'bi-cart' , path: '/admin/orders'},
    { name: 'Users', icon: 'bi-people', path: '/admin/users' },
    { name: 'Analytics', icon: 'bi-bar-chart-line', path: '/admin/analytics' },
    { name: 'Reviews', icon: 'bi-chat-left', path: '/admin/reviews' },
    { name: 'Settings', icon: 'bi-gear', path: '/admin/settings' },
  ];

  return (
    <>
      {/* Custom CSS for the Hover State */}
      <style>{`
        .custom-nav-link {
          transition: all 0.2s ease-in-out;
        }
        .custom-nav-link:hover:not(.active-tab) {
          background-color: #f8f9fa !important;
          color: #0d6efd !important;
        }
        .custom-nav-link:hover:not(.active-tab) i {
          color: #0d6efd !important;
        }
      `}</style>

      <div className="d-flex flex-column h-100 bg-white border-end">
        
        {/* --- Logo Section --- */}
        <div className="p-4 border-bottom d-flex align-items-center">
          <i className="bi bi-book text-primary fs-3 me-3"></i>
          <div>
            <h5 className="mb-0 fw-semibold" style={{ letterSpacing: '-0.5px' }}>BookStore</h5>
            <div className="text-secondary small">Admin Panel</div>
          </div>
        </div>

        {/* --- Navigation Links --- */}
        <div className="flex-grow-1 p-3">
          <ul className="nav nav-pills flex-column gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <li className="nav-item" key={item.name}>
                  <button
                    onClick={() => navigate(item.name)}
                    className={`nav-link w-100 d-flex align-items-center py-3 px-3 border-0 rounded-3 text-start custom-nav-link ${
                      isActive ? 'active-tab fw-medium' : ''
                    }`}
                    style={{
                      backgroundColor: isActive ? '#f0f7ff' : 'transparent',
                      color: isActive ? '#0d6efd' : '#4a5568',
                    }}
                  >
                    <i className={`bi ${item.icon} fs-5 me-3 ${isActive ? 'text-primary' : 'text-secondary'}`}></i>
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* --- Footer User Profile --- */}
        <div className="p-4 border-top">
          <div className="d-flex align-items-center" style={{ cursor: 'pointer' }}>
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3 shadow-sm"
              style={{ 
                width: '45px', 
                height: '45px', 
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                fontSize: '0.9rem'
              }}
            >
              AD
            </div>
            <div className="overflow-hidden">
              <h6 className="mb-0 fw-semibold text-dark">Admin User</h6>
              <div className="text-secondary small text-truncate">admin@bookstore.com</div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Sidebar;