const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
});

module.exports = mongoose.model('Course', courseSchema);