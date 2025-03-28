import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import contractABI from '../abi.json';

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

function AdminDashboard({ user }) {
  const [studentAddress, setStudentAddress] = useState('');
  const [studentName, setStudentName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [removeAdminAddress, setRemoveAdminAddress] = useState('');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]); // New state for pending approvals

  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchPendingApprovals(); // Fetch pending approvals on load
  }, []);

  const fetchStudents = async () => {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/students`);
    setStudents(response.data.students);
  };

  const fetchCourses = async () => {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/courses`);
    setCourses(response.data.courses);
  };

  const fetchPendingApprovals = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/pending-approvals`);
      setPendingApprovals(response.data.pendingApprovals || []);
    } catch (error) {
      console.error('Fetch pending approvals error:', error.response || error.message);
    }
  };

  const addStudent = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/admin/add-student`, {
        walletAddress: studentAddress.toLowerCase(),
        name: studentName,
        regNumber,
      });
      console.log('Add student response:', response.data);
      setStudentAddress('');
      setStudentName('');
      setRegNumber('');
      fetchStudents();
    } catch (error) {
      console.error('Add student error:', error.response || error.message);
      alert('Failed to add student: ' + (error.response?.data?.error || error.message));
    }
  };

  const deleteStudent = async (regNumber) => {
    await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/admin/delete-student/${regNumber}`);
    fetchStudents();
  };

  const addCourse = async () => {
    await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/admin/add-course`, {
      courseId,
      name: courseName,
      description: courseDescription,
      capacity,
    });
    setCourseId('');
    setCourseName('');
    setCourseDescription('');
    setCapacity('');
    fetchCourses();
  };

  const deleteCourse = async (courseId) => {
    await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/admin/delete-course/${courseId}`);
    fetchCourses();
  };

  const approveCourse = async (studentAddress, courseId) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.approveCourse(studentAddress, courseId);
      await tx.wait();
      fetchPendingApprovals(); // Refresh the list after approval
    } catch (error) {
      console.error('Approve course error:', error.message);
      alert('Failed to approve course: ' + error.message);
    }
  };

  const addAdmin = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const tx = await contract.addAdmin(newAdminAddress);
    await tx.wait();
    setNewAdminAddress('');
  };

  const removeAdmin = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const tx = await contract.removeAdmin(removeAdminAddress);
    await tx.wait();
    setRemoveAdminAddress('');
  };

  return (
    <div>
      <h2 className="mb-4">Admin Dashboard: {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</h2>

      {/* Manage Students Section */}
      <div className="card mb-4">
        <div className="card-header">Manage Students</div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <input
                type="text"
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
                placeholder="Student Wallet Address"
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Student Name"
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="Reg Number"
                className="form-control"
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-success w-100" onClick={addStudent}>
                Add Student
              </button>
            </div>
          </div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Reg Number</th>
                <th>Wallet Address</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.regNumber}>
                  <td>{student.name}</td>
                  <td>{student.regNumber}</td>
                  <td>{student.walletAddress.slice(0, 6)}...{student.walletAddress.slice(-4)}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteStudent(student.regNumber)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Courses Section */}
      <div className="card mb-4">
        <div className="card-header">Manage Courses</div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-2">
              <input
                type="number"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="Course ID"
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Course Code"
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                placeholder="Course title"
                className="form-control"
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="unit"
                className="form-control"
              />
            </div>
            <div className="col-md-1">
              <button className="btn btn-success w-100" onClick={addCourse}>
                Add
              </button>
            </div>
          </div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>ID</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.courseId}>
                  <td>{course.name}</td>
                  <td>{course.courseId}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteCourse(course.courseId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Courses Section */}
      <div className="card mb-4">
        <div className="card-header">Approve Courses</div>
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Student Wallet</th>
                <th>Course ID</th>
                <th>Course Code</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.length > 0 ? (
                pendingApprovals.map((approval, index) => (
                  <tr key={index}>
                    <td>{approval.studentAddress.slice(0, 6)}...{approval.studentAddress.slice(-4)}</td>
                    <td>{approval.courseId}</td>
                    <td>{approval.courseName || 'N/A'}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => approveCourse(approval.studentAddress, approval.courseId)}
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No pending approvals</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Admins Section */}
      <div className="card">
        <div className="card-header">Manage Admins</div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-9">
              <input
                type="text"
                value={newAdminAddress}
                onChange={(e) => setNewAdminAddress(e.target.value)}
                placeholder="New Admin Address"
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary w-100" onClick={addAdmin}>
                Add Admin
              </button>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-md-9">
              <input
                type="text"
                value={removeAdminAddress}
                onChange={(e) => setRemoveAdminAddress(e.target.value)}
                placeholder="Admin Address to Remove"
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <button className="btn btn-danger w-100" onClick={removeAdmin}>
                Remove Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;