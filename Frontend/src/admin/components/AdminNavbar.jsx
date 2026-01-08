import React  ,{ useState }from 'react';
import { useNavigate} from 'react-router-dom';
import LogoutPopup from './LogoutPopup';

const AdminNavbar = () => {
  const navigate = useNavigate();
  
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutPopup(true);
  };

  const handleCloseModal = () => {
    setShowLogoutPopup(false);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');
    setShowLogoutPopup(false);
    navigate('/login');
  };


return(
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
        <i className="bi bi-gear fs-5 me-4"></i>

        <div 
            onClick={handleLogoutClick} 
            className="d-flex align-items-center text-danger" 
            style={{ cursor: 'pointer' }}
            title="Logout"
          >
            <i className="bi bi-box-arrow-right fs-5"></i>
          </div>

          <LogoutPopup 
        show={showLogoutPopup} 
        onClose={handleCloseModal} 
        onConfirm={handleConfirmLogout} 
      />
      </div>
    </div>
  </nav>
);
};
export default AdminNavbar;




