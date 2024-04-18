const express = require('express');
const router = express.Router();
const authMiddleWare = require('../middleware/auth')
const auth = authMiddleWare.auth;
const courseController = require('../controller/course')

router
.get('/getEnrolledCourses',auth,courseController.getEnrolledCourses)
.get('/getAllCourses',auth,courseController.getAllCourses)
.patch('/enrollCourse',auth,courseController.enrollCourse)
.post('/addCourse',auth,courseController.addCourse);


exports.router = router;