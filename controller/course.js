const model = require("../models/user");
const User = model.User;
const courseModel = require("../models/courses");
const Course = courseModel.Course;

exports.getAllCourses = async (req, res) => {

    try{
        const courses = await Course.find({});
        const message = "Fetched Successfully"
        res.status(200).json({courses,message});
    }
    catch(err){
        console.log(err);
        const message = "an error occurred";
        res.status(400).json({err,message});
    }
    
}
exports.getEnrolledCourses = async (req, res) => {
    try{
        const user = await User.findById(req.userId);
        const courses = user.courses;
        const enrolledCourses = await Course.find({ courseCode: { $in: courses } });
        const message = "Fetched Successfully"
        res.status(200).json({message,enrolledCourses});
    }
    catch(err){
        console.log(err);
    }
    

}

exports.enrollCourse = async (req, res) => {

    try{
        const userId = req.userId;
        const user = await User.findById(userId);
        const course = user.courses;
        const {courseCode} = req.body;
        console.log("Body",req.body);
        console.log(courseCode);


        const newCourses = courseCode.filter(code => !course.includes(code));
        console.log("Unenrolled Courses",newCourses)
        if(newCourses.length===0){
            const message = "Already Enrolled in all the selected courses"
            return res.status(400).json({message});
        }
        newCourses.map((course)=>{
            user.courses.push(course);
        })
        
        user.save().then((result)=>{
            const message = "Enrolled Successfully"
            res.status(202).json({result,message});
        }).catch((err)=>{
            console.log(err);
            const message = "an error occurred"
            res.status(400).json({err,message})
        })
    }
    catch(err){
        console.log(err);
        const message = "an error occurred"
        res.status(400).json({err,message})
    }
    

}
exports.addCourse = async (req, res) => {
    const course = new Course(req.body);
    course.save().then((result)=>{
        console.log("Result",result);
        const message = "Saved Successfully"
        res.status(200).json({result,message})
    }).catch((err)=>{
        console.log("Error",err);
        if (err.code === 11000 && err.keyPattern.courseCode) {
           const  message = "Course Code Already Exists";
           console.log("Message",message)
            res.status(400).json({ err, message });
            return;
          }
        const message = "an error occurred";
        res.status(400).json({err,message});
    })
}