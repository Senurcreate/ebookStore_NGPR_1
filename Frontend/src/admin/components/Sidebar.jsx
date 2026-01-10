import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Blogo from "../../assets/BrandLogo.svg";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: 'bi-grid' , path: '/admin/dashboard'},
    { name: 'Books', icon: 'bi-book' , path: '/admin/books'},
    { name: 'Purchases', icon: 'bi-cart' , path: '/admin/purchases'},
    { name: 'Users', icon: 'bi-people', path: '/admin/users' },
    { name: 'Analytics', icon: 'bi-bar-chart-line', path: '/admin/analytics' },
    { name: 'Reviews', icon: 'bi-chat-left', path: '/admin/reviews' },
    
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
        <div className="p-4 border-bottom d-flex align-items-center bg-white">
  {/* 1. Logo: Set height, let width adjust automatically */}
          <img
            src={Blogo}
            alt="brand logo"
            className="me-3"
            style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
          />

          {/* 2. Vertical Divider (Optional) */}
          <div className="vr me-3 text-secondary" style={{ height: '25px' }}></div>

          {/* 3. Admin Text */}
          <div className="d-flex flex-column justify-content-center">
            
            <span className="text-muted small text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
              Admin Panel
            </span>
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
                    onClick={() => navigate(item.path)}
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