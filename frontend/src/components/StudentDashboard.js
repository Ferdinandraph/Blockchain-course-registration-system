import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import contractABI from '../abi.json';

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

function StudentDashboard({ user }) {
  const [courseId, setCourseId] = useState('');
  const [pendingCourses, setPendingCourses] = useState([]);
  const [approvedCourses, setApprovedCourses] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
    fetchStudentCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/courses`);
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Fetch courses error:', error.response || error.message);
    }
  };

  const fetchStudentCourses = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/student/courses/${user.walletAddress}`);
      setPendingCourses(response.data.pending || []);
      setApprovedCourses(response.data.approved || []);
    } catch (error) {
      console.error('Fetch student courses error:', error.response || error.message);
      alert('Failed to load courses: ' + (error.response?.data?.error || error.message));
    }
  };

  const addCourse = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.addCourse(courseId);
      await tx.wait();
      setCourseId('');
      await fetchStudentCourses();
    } catch (error) {
      console.error('Add course error:', error.message);
      alert('Failed to add course: ' + error.message);
    }
  };

  const removeCourse = async (courseId) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.removeCourse(courseId);
      await tx.wait();
      await fetchStudentCourses();
    } catch (error) {
      console.error('Remove course error:', error.message);
      alert('Failed to remove course: ' + error.message);
    }
  };

  return (
    <div>
      <h2 className="mb-4">Welcome, {user.name} ({user.regNumber})</h2>

      <div className="card mb-4">
        <div className="card-header">Add Course</div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <input
                type="number"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="Course ID"
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <button className="btn btn-success w-100" onClick={addCourse}>
                Add Course
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">Available Courses</div>
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.courseId}>
                  <td>{course.name}</td>
                  <td>{course.courseId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">Pending Courses</div>
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Course ID</th>
                <th>Course Code</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingCourses.map((course, index) => (
                <tr key={index}>
                  <td>{course.courseId}</td>
                  <td>{course.courseCode}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeCourse(course.courseId)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Approved Courses</div>
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Course ID</th>
                <th>Course Code</th>
              </tr>
            </thead>
            <tbody>
              {approvedCourses.map((course, index) => (
                <tr key={index}>
                  <td>{course.courseId}</td>
                  <td>{course.courseCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;