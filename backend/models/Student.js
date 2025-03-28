const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true },
  name: { type: String, required: true },
  regNumber: { type: String, required: true, unique: true }, // e.g., "20191181582"
});

module.exports = mongoose.model('Student', studentSchema);