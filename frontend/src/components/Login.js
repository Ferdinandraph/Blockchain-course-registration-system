import React, { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const contractABI = require('../abi.json');
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

function Login({ setUser }) {
  const [account, setAccount] = useState(null);
  const [regNumber, setRegNumber] = useState('');
  const [isAdminView, setIsAdminView] = useState(false);
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        console.log('Connected accounts:', accounts);
        setAccount(accounts[0]);
      } catch (error) {
        console.error('MetaMask connection failed:', error);
        alert('Failed to connect to MetaMask: ' + error.message);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const loginAsStudent = async () => {
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/student/login`;
    console.log('Attempting login...');
    console.log('Requesting URL:', url);
    console.log('Sending (raw):', JSON.stringify({ walletAddress: account, regNumber }));
    console.log('Sending (trimmed):', JSON.stringify({ walletAddress: account?.toLowerCase(), regNumber: regNumber.trim() }));
    if (!account || !regNumber) {
      console.log('Missing account or regNumber');
      return alert('Please connect wallet and enter registration number');
    }
    try {
      console.log('Making axios request...');
      const response = await axios.post(url, {
        walletAddress: account.toLowerCase(),
        regNumber: regNumber.trim(),
      });
      console.log('Response:', response.data);
      setUser({ type: 'student', data: response.data.student });
      console.log('Navigating to /student...');
      navigate('/student');
    } catch (error) {
      console.error('Login error:', error.response || error.message);
      alert('Login failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const loginAsAdmin = async () => {
    if (!account) return alert('Please connect wallet first');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const isAdmin = await contract.isAdmin(account);
      if (isAdmin) {
        setUser({ type: 'admin', data: { walletAddress: account } });
        navigate('/admin');
      } else {
        alert('This wallet is not an admin.');
      }
    } catch (error) {
      alert('Admin login failed: ' + error.message);
    }
  };

  return (
    <div className="text-center">
      <h2 className="mb-4">Login</h2>
      {!isAdminView ? (
        <div className="card mx-auto" style={{ maxWidth: '400px' }}>
          <div className="card-body">
            <h5 className="card-title">Student Login</h5>
            <input
              type="text"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder="Registration Number (e.g., 20201151429)"
              className="form-control mb-3"
            />
            {!account ? (
              <button className="btn btn-primary w-100 mb-3" onClick={connectWallet}>
                Connect Wallet
              </button>
            ) : (
              <p className="mb-3 text-muted">Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
            )}
            <button className="btn btn-primary w-100 mb-3" onClick={loginAsStudent}>
              Login
            </button>
            <button className="btn btn-link" onClick={() => setIsAdminView(true)}>
              Login as Admin instead
            </button>
          </div>
        </div>
      ) : (
        <div className="card mx-auto" style={{ maxWidth: '400px' }}>
          <div className="card-body">
            <h5 className="card-title">Admin Login</h5>
            {!account ? (
              <button className="btn btn-primary w-100 mb-3" onClick={connectWallet}>
                Connect Wallet
              </button>
            ) : (
              <p className="mb-3 text-muted">Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
            )}
            <button className="btn btn-primary w-100 mb-3" onClick={loginAsAdmin}>
              Login
            </button>
            <button className="btn btn-link" onClick={() => setIsAdminView(false)}>
              Login as Student instead
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;