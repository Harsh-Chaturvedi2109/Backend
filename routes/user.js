const express = require("express");
const userController = require("../controller/users")
const router = express.Router()
const authMiddleWare = require('../middleware/auth')
const auth = authMiddleWare.auth;
router.get("/", auth,userController.getAllUsers)
.get("/academicDetails",auth,userController.getAcademicDetails)
.get("/search",auth,userController.searchUser)
.get("/references",userController.references)
.get("/:search",auth, userController.getUser)
.post("/",userController.createUser)
.post("/uploadProfilePic/:email",auth,userController.uploadProfilePic)
.post("/registerForExam",auth,userController.registerForExam)
.patch('/:email',auth,userController.updateUser)
.put('/:email',auth,userController.replaceUser)
.delete('/deleteSelectedUser',auth, userController.deleteSelectedUser)
.delete('/:email',auth,userController.deleteUser)
.post("/addAcademicDetails",auth,userController.addAcademicDetails)

exports.router = router;