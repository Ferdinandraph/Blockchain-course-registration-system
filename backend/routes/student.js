const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Course = require('../models/Course'); // Add this

module.exports = (contract) => {
  router.post('/login', async (req, res) => {
    const { walletAddress, regNumber } = req.body;
    const normalizedWalletAddress = walletAddress.toLowerCase();
    console.log('Received login request:', { walletAddress: normalizedWalletAddress, regNumber });
    try {
      const student = await Student.findOne({ walletAddress: normalizedWalletAddress, regNumber });
      if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
      res.json({ success: true, student });
    } catch (error) {
      console.error('Login error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/courses/:walletAddress', async (req, res) => {
    const { walletAddress } = req.params;
    console.log('Fetching courses for:', walletAddress);
    try {
      console.log('Contract address:', process.env.CONTRACT_ADDRESS);
      console.log('Calling getPendingCourses...');
      const pending = await contract.getPendingCourses(walletAddress);
      console.log('Pending courses:', pending);
      console.log('Calling getApprovedCourses...');
      const approved = await contract.getApprovedCourses(walletAddress);
      console.log('Approved courses:', approved);

      // Convert BigInt to Number
      const pendingIds = pending.map(courseId => Number(courseId));
      const approvedIds = approved.map(courseId => Number(courseId));

      // Fetch course details from MongoDB
      const courses = await Course.find({ courseId: { $in: [...pendingIds, ...approvedIds] } });
      console.log('Fetched course details:', courses);

      // Enrich pending courses
      const pendingCourses = pendingIds.map(courseId => {
        const course = courses.find(c => c.courseId === courseId);
        return {
          courseId,
          courseCode: course ? course.name : 'Unknown',
        };
      });

      // Enrich approved courses
      const approvedCourses = approvedIds.map(courseId => {
        const course = courses.find(c => c.courseId === courseId);
        return {
          courseId,
          courseCode: course ? course.name : 'Unknown',
        };
      });

      res.json({ success: true, pending: pendingCourses, approved: approvedCourses });
    } catch (error) {
      console.error('Fetch courses error:', error.message, error.stack);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};