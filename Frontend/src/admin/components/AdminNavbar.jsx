import React from 'react'

const AdminNavbar = () => (
  <nav className="navbar navbar-light bg-white border-bottom px-4">
    <div className="container-fluid">
      <div className="input-group w-50">
        <span className="input-group-text bg-light border-end-0"><i className="bi bi-search"></i></span>
        <input type="text" className="form-control bg-light border-start-0" placeholder="Search books, orders..." />
      </div>
      <div className="d-flex align-items-center">
        <i className="bi bi-bell fs-5 me-4 position-relative">
           <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
        </i>
        <i className="bi bi-gear fs-5"></i>
      </div>
    </div>
  </nav>
);
export default AdminNavbar;




