import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="brand-icon">🚨</span>
          <h1 className="brand-title">Disaster Dashboard</h1>
        </div>
        
        <div className="navbar-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <span className="link-icon">📊</span>
            Dashboard
          </Link>
          <Link 
            to="/report" 
            className={`nav-link ${isActive('/report') ? 'active' : ''}`}
          >
            <span className="link-icon">📝</span>
            Report
          </Link>
        </div>
      </div>
    </nav>
  );
}