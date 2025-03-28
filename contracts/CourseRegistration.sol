// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CourseRegistration {
    mapping(address => bool) public admins; // Mapping to track admin status
    mapping(address => uint[]) public studentPendingCourses;
    mapping(address => uint[]) public studentApprovedCourses;
    mapping(uint => uint) public courseCapacity;
    mapping(uint => uint) public courseEnrollmentCount;

    event CourseAdded(address indexed student, uint courseId);
    event CourseApproved(address indexed student, uint courseId);
    event AdminAdded(address indexed newAdmin);
    event AdminRemoved(address indexed removedAdmin);

    constructor() {
        admins[msg.sender] = true; // Deployer is the first admin
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin can call this");
        _;
    }

    // Add a new admin (only existing admins can call)
    function addAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        require(!admins[newAdmin], "Already an admin");
        admins[newAdmin] = true;
        emit AdminAdded(newAdmin);
    }

    // Remove an admin (only existing admins can call)
    function removeAdmin(address adminToRemove) external onlyAdmin {
        require(admins[adminToRemove], "Not an admin");
        require(msg.sender != adminToRemove, "Cannot remove yourself"); // Prevent self-removal for safety
        admins[adminToRemove] = false;
        emit AdminRemoved(adminToRemove);
    }

    function setCourseCapacity(uint courseId, uint maxStudents) external onlyAdmin {
        courseCapacity[courseId] = maxStudents;
    }

    function addCourse(uint courseId) external {
        require(courseEnrollmentCount[courseId] < courseCapacity[courseId], "Course is full");
        studentPendingCourses[msg.sender].push(courseId);
        emit CourseAdded(msg.sender, courseId);
    }

    function removeCourse(uint courseId) external {
        uint[] storage courses = studentPendingCourses[msg.sender];
        for (uint i = 0; i < courses.length; i++) {
            if (courses[i] == courseId) {
                courses[i] = courses[courses.length - 1];
                courses.pop();
                break;
            }
        }
    }

    function approveCourse(address student, uint courseId) external onlyAdmin {
        uint[] storage pending = studentPendingCourses[student];
        for (uint i = 0; i < pending.length; i++) {
            if (pending[i] == courseId) {
                pending[i] = pending[pending.length - 1];
                pending.pop();
                studentApprovedCourses[student].push(courseId);
                courseEnrollmentCount[courseId]++;
                emit CourseApproved(student, courseId);
                break;
            }
        }
    }

    function getPendingCourses(address student) external view returns (uint[] memory) {
        return studentPendingCourses[student];
    }

    function getApprovedCourses(address student) external view returns (uint[] memory) {
        return studentApprovedCourses[student];
    }

    // Optional: Check if an address is an admin
    function isAdmin(address account) external view returns (bool) {
        return admins[account];
    }
}