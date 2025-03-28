const express = require('express');
const mongoose = require('mongoose');
const { ethers } = require('ethers');
const cors = require('cors');
require('dotenv').config();

const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB error:', err));

// Ethereum setup
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_PROJECT_ID}`);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractABI = require('./abi.json');
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

// Pass contract to routes
app.use('/api/student', studentRoutes(contract));
app.use('/api/admin', adminRoutes(contract));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));