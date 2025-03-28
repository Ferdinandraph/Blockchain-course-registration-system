import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'; // No need for BrowserRouter here
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const contractABI = require('./abi.json');
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      if (parsedUser && (!parsedUser.type || !parsedUser.data)) {
        console.warn('Invalid user data in localStorage, resetting');
        localStorage.removeItem('user');
        return null;
      }
      return parsedUser;
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
      localStorage.removeItem('user');
      return null;
    }
  });

  const location = useLocation();

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (location.pathname === '/' && user) {
      setUser(null); // Logout when returning to home
    }
  }, [location.pathname]);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Header */}
      <header className="bg-primary text-white p-3 shadow sticky-top">
        <div className="container d-flex justify-content-between align-items-center">
          <Link to="/" className="text-white text-decoration-none">
            <h1 className="h4 mb-0">Course Registration System</h1>
          </Link>
          {user && user.data && location.pathname !== '/' && (
            <div className="d-flex align-items-center gap-3">
              <span>
                {user.type === 'admin'
                  ? `Admin (${user.data.walletAddress.slice(0, 6)}...${user.data.walletAddress.slice(-4)})`
                  : `${user.data.name} (${user.data.regNumber})`}
              </span>
              <button className="btn btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow-1 container my-4">
        <Routes>
          <Route path="/" element={<Login setUser={setUser} />} />
          <Route
            path="/student"
            element={user?.type === 'student' ? <StudentDashboard user={user.data} /> : <Navigate to="/" />}
          />
          <Route
            path="/admin"
            element={user?.type === 'admin' ? <AdminDashboard user={user.data} /> : <Navigate to="/" />}
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white py-3">
        <div className="container text-center">
          <p className="mb-0">© 2025 Course Registration System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;