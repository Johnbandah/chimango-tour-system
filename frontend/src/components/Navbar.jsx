import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    display: 'inline-block'
  };

  const buttonStyle = {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  return (
    <nav style={{ 
      padding: '1rem 2rem', 
      backgroundColor: '#2c3e50', 
      color: 'white', 
      display: 'flex', 
      gap: '0.5rem', 
      alignItems: 'center',
      flexWrap: 'wrap',
      width: '100%',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <Link to="/" style={linkStyle}>Home</Link>
      <Link to="/activities" style={linkStyle}>Activities</Link>
      <Link to="/about" style={linkStyle}>About Us</Link>  {/* MOVED HERE - outside the conditional */}
      
      {user ? (
        <>
          {user.role !== 'admin' && (
            <Link to="/bookings" style={linkStyle}>My Bookings</Link>
          )}
          
          {user.role !== 'admin' && (
            <Link to="/profile" style={linkStyle}>My Profile</Link>
          )}
          
          {user.role === 'admin' && (
            <>
              <Link to="/admin" style={linkStyle}>Dashboard</Link>
              <Link to="/admin/images" style={linkStyle}>Manage Images</Link>
            </>
          )}
          
          <span style={{ marginLeft: 'auto', marginRight: '16px' }}>Welcome, {user.fullName}</span>
          
          <button onClick={logout} style={buttonStyle}>Logout</button>
        </>
      ) : (
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <Link to="/login" style={linkStyle}>Login</Link>
          <Link to="/register" style={linkStyle}>Register</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;