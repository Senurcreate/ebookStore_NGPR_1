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
        
        
      </div>
      <div className="d-flex align-items-center">
        
        

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




