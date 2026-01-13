import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext'; 

const Users = () => {
  const { currentUser } = useAuth(); 
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  
  // --- SEARCH STATES ---
  const [searchQuery, setSearchQuery] = useState('');      
  const [executedSearch, setExecutedSearch] = useState(''); 

  // Filters
  const [roleFilter, setRoleFilter] = useState('All Roles'); 

  // Pagination 
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // --- FETCH DATA ---
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: page,
        limit: 20,
        search: executedSearch 
      };

      if (roleFilter !== 'All Roles') {
        params.role = roleFilter.toLowerCase();
      }

      const res = await axiosInstance.get('/users', { params }); 

      if (res.data.success) {
        setUsers(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setTotalUsers(res.data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- EFFECT UPDATE ---
  useEffect(() => {
    fetchUsers();
  }, [executedSearch, roleFilter, page]);

  // --- HANDLERS ---
  
  // Reset Handler
  const handleReset = () => {
    setSearchQuery('');       // Clear visual input
    setExecutedSearch('');    // Clear actual search param
    setRoleFilter('All Roles'); // Reset dropdown
    setPage(1);               // Reset to page 1
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        setExecutedSearch(searchQuery); 
        setPage(1); 
    }
  };

  const handleSearchClick = () => {
      setExecutedSearch(searchQuery);
      setPage(1);
  };

  const handleFilterChange = (e) => {
      setRoleFilter(e.target.value);
      setPage(1);
  };

  // --- ACTIONS ---

  const handleExport = () => {
    if (users.length === 0) return alert("No users to export");

    const headers = ["User ID,Name,Email,Role,Total Spent,Status,Joined Date\n"];
    
    const rows = users.map(user => {
        return [
            user._id,
            `"${user.displayName || 'Unknown'}"`,
            user.email,
            user.role,
            (user.totalSpent || 0).toFixed(2),
            user.disabled ? 'Suspended' : 'Active',
            new Date(user.createdAt).toLocaleDateString()
        ].join(",");
    });

    const csvContent = headers.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleStatus = async (userId, currentStatus, userName) => {
    if (currentUser && currentUser.uid === userId) {
        return alert("Action denied: You cannot suspend your own admin account.");
    }

    const action = currentStatus ? 'activate' : 'suspend'; 
    if (!window.confirm(`Are you sure you want to ${action} "${userName}"?`)) return;

    try {
        await axiosInstance.put(`/admin/users/${userId}`, { disabled: !currentStatus });
        setUsers(prev => prev.map(user => 
            user._id === userId ? { ...user, disabled: !currentStatus } : user
        ));
        setOpenMenuIndex(null);
    } catch (error) {
        alert("Failed to update status: " + (error.response?.data?.message || error.message));
    }
  };

  const toggleMenu = (index, e) => {
    e.stopPropagation();
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  // --- CUSTOM BADGES ---
  const renderRoleBadge = (role) => {
      const lowerRole = role ? role.toLowerCase() : 'user';

      if (lowerRole === 'admin') {
          return (
              <span className="badge d-inline-flex align-items-center border" 
                style={{ 
                    backgroundColor: '#ffe2e5', 
                    color: '#f64e60',           
                    fontSize: '11px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: '600'
                }}>
                  <i className="bi bi-shield-lock-fill me-2"></i> ADMIN
              </span>
          );
      }
      return (
          <span className="badge d-inline-flex align-items-center border" 
            style={{ 
                backgroundColor: '#f1faff', 
                color: '#0095e8',           
                fontSize: '11px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: '600'
            }}>
              <i className="bi bi-person-fill me-2"></i> User
          </span>
      );
  };

  if (loading && users.length === 0) return <div className="p-5 text-center text-muted">Loading Users...</div>;

  return (
    <div className="container-fluid py-4 px-4" onClick={() => setOpenMenuIndex(null)} style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">User Management</h2>
          <p className="text-muted">Manage registered accounts ({totalUsers} Total)</p>
        </div>
        <button 
            onClick={handleExport}
            className="btn btn-white bg-white border d-flex align-items-center px-4 py-2 rounded-3 fw-medium shadow-sm"
        >
          <i className="bi bi-download me-2"></i> Export List
        </button>
      </div>

      {/* Main Table Card */}
      <div className="card border-0 shadow-sm p-0 overflow-hidden" style={{ borderRadius: '16px' }}>
        
        {/* Toolbar */}
        <div className="p-4 bg-white border-bottom">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <div className="input-group bg-light rounded-3 px-3 py-2 border-0">
                <button 
                    className="input-group-text bg-transparent border-0 text-muted ps-0 btn" 
                    onClick={handleSearchClick}
                    style={{ cursor: 'pointer' }}
                >
                  <i className="bi bi-search"></i>
                </button>
                <input 
                  type="text" 
                  className="form-control bg-transparent border-0 shadow-none ps-2" 
                  placeholder="Search by name or email... (Press Enter)" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  onKeyDown={handleKeyDown} 
                />
              </div>
            </div>
            <div className="col-md-7 d-flex justify-content-md-end gap-3">
              <select 
                className="form-select bg-light border-0 px-3 py-2 rounded-3 text-muted shadow-sm" 
                style={{ width: 'auto', minWidth: '160px' }}
                value={roleFilter}
                onChange={handleFilterChange}
              >
                <option>All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
              </select>

              {/* UPDATED RESET BUTTON */}
              <button 
                className="btn btn-white bg-white border d-flex align-items-center justify-content-center rounded-3 text-dark fw-medium shadow-sm"
                style={{ width: '42px', height: '40px' }}
                onClick={handleReset}
                disabled={loading}
                title="Reset Filters"
              >
                {loading ? (
                    <span className="spinner-border spinner-border-sm text-secondary" role="status" aria-hidden="true"></span>
                ) : (
                    <i className="bi bi-arrow-clockwise"></i>
                )}
              </button>

            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table align-middle mb-0 custom-admin-table">
            <thead>
              <tr className="text-uppercase small text-secondary border-bottom">
                <th className="ps-4 py-3 fw-bold bg-light">USER</th>
                <th className="py-3 fw-bold bg-light">CONTACT</th>
                <th className="py-3 fw-bold bg-light">ROLE</th>
                <th className="py-3 fw-bold bg-light text-end pe-5">TOTAL SPENT</th>
                <th className="py-3 fw-bold bg-light text-center">STATUS</th>
                <th className="py-3 fw-bold bg-light text-end pe-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, i) => (
                <tr key={user._id || i} className="border-bottom">
                  
                  {/* User Profile */}
                  <td className="ps-4 py-3">
                    <div className="d-flex align-items-center">
                      {user.photoURL ? (
                        <img 
                            src={user.photoURL} 
                            className="rounded-circle me-3 border" 
                            width="40" height="40" 
                            style={{objectFit:'cover'}} 
                            alt=""
                            onError={(e) => e.target.src = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                        />
                      ) : (
                        <div className="rounded-circle me-3 bg-light d-flex align-items-center justify-content-center border text-secondary" style={{width:'40px', height:'40px'}}>
                            <i className="bi bi-person-fill fs-5"></i>
                        </div>
                      )}
                      <div>
                        <div className="fw-bold text-dark">{user.displayName || 'Unknown'}</div>
                        <div className="text-muted small">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="text-secondary">{user.email}</td>

                  {/* Role */}
                  <td>{renderRoleBadge(user.role)}</td>

                  {/* Financials */}
                  <td className="fw-bold text-dark text-end pe-5">
                    Rs {(user.totalSpent || 0).toFixed(2)}
                  </td>

                  {/* Status */}
                  <td className="text-center">
                    <span className="badge rounded-pill fw-normal" style={{ 
                        backgroundColor: user.disabled ? '#dc3545' : '#00d25b', 
                        color: '#fff',
                        padding: '6px 12px'
                      }}>
                      {user.disabled ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  
                  {/* Actions */}
                  <td className="text-end pe-4 position-relative">
                    <button className="btn btn-link text-secondary p-0 shadow-none" onClick={(e) => toggleMenu(i, e)}>
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                    
                    {openMenuIndex === i && (
                      <div 
                        className="position-absolute end-0 mt-1 bg-white rounded-3 shadow border py-2" 
                        style={{ zIndex: 1000, minWidth: '170px', right: '40px' }}
                      >
                        <button 
                            className={`dropdown-item px-3 py-2 small d-flex align-items-center ${user.disabled ? 'text-success' : 'text-danger'}`}
                            onClick={() => handleToggleStatus(user._id, user.disabled, user.displayName)}
                        >
                          <i className={`bi ${user.disabled ? 'bi-check-circle' : 'bi-slash-circle'} me-2`}></i> 
                          {user.disabled ? 'Activate' : 'Suspend'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
             ) : (
                <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">No users found.</td>
                </tr>
             )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {totalUsers > 0 && (
            <div className="d-flex justify-content-between align-items-center p-4 border-top bg-light">
                <span className="text-muted small">
                    Showing <strong>{(page - 1) * 20 + 1}-{Math.min(page * 20, totalUsers)}</strong> of <strong>{totalUsers}</strong>
                </span>
                <nav>
                    <ul className="pagination mb-0 shadow-sm small">
                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                            <button className="page-link border-0 text-dark" onClick={() => setPage(page - 1)} disabled={page === 1}>Prev</button>
                        </li>
                        <li className="page-item active">
                            <span className="page-link bg-dark border-dark">{page}</span>
                        </li>
                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link border-0 text-dark" onClick={() => setPage(page + 1)} disabled={page === totalPages}>Next</button>
                        </li>
                    </ul>
                </nav>
            </div>
        )}

      </div>
    </div>
  );
};

export default Users;