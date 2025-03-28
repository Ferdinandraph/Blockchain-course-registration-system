const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Course = require('../models/Course');

module.exports = (contract) => {
  router.post('/add-student', async (req, res) => {
    const { walletAddress, name, regNumber } = req.body;
    const normalizedWalletAddress = walletAddress.toLowerCase();
    console.log('Adding student:', { walletAddress: normalizedWalletAddress, name, regNumber });
    try {
      const existingStudent = await Student.findOne({ regNumber });
      if (existingStudent) {
        return res.status(400).json({ success: false, error: 'Student with this registration number already exists' });
      }
      const student = new Student({ walletAddress: normalizedWalletAddress, name, regNumber });
      await student.save();
      console.log('Student added:', student);
      res.json({ success: true });
    } catch (error) {
      console.error('Error adding student:', error);
      if (error.code === 11000) {
        res.status(400).json({ success: false, error: 'Duplicate registration number or wallet address' });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  });

  router.delete('/delete-student/:regNumber', async (req, res) => {
    const { regNumber } = req.params;
    try {
      await Student.deleteOne({ regNumber });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/add-course', async (req, res) => {
    const { courseId, name, description, capacity } = req.body;
    try {
      const course = new Course({ courseId, name, description });
      await course.save();
      const tx = await contract.setCourseCapacity(courseId, capacity);
      await tx.wait();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.delete('/delete-course/:courseId', async (req, res) => {
    const { courseId } = req.params;
    try {
      await Course.deleteOne({ courseId });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/approve-course', async (req, res) => {
    const { studentAddress, courseId } = req.body;
    try {
      const tx = await contract.approveCourse(studentAddress, courseId);
      await tx.wait();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/courses', async (req, res) => {
    try {
      const courses = await Course.find();
      res.json({ success: true, courses });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/students', async (req, res) => {
    try {
      const students = await Student.find();
      res.json({ success: true, students });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/pending-approvals', async (req, res) => {
    try {
      const students = await Student.find(); // Get all students from MongoDB
      const pendingApprovals = [];

      for (const student of students) {
        // Fetch pending courses from the smart contract
        const pendingCourses = await contract.getPendingCourses(student.walletAddress);
        const pendingCourseIds = pendingCourses.map(id => Number(id)); // Convert BigInt to Number

        for (const courseId of pendingCourseIds) {
          // Fetch course details from MongoDB
          const course = await Course.findOne({ courseId });
          pendingApprovals.push({
            studentAddress: student.walletAddress,
            courseId,
            courseName: course ? course.name : 'Unknown',
          });
        }
      }

      res.json({ success: true, pendingApprovals });
    } catch (error) {
      console.error('Fetch pending approvals error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};