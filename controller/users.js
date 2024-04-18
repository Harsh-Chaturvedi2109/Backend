// const fs = require("fs");
// const data = JSON.parse(fs.readFileSync("data.json", "utf-8"));
// let users = data.users;
const model = require("../models/user");
const User = model.User;
const courseModel = require("../models/courses");
const Course = courseModel.Course;
const bcrypt = require("bcrypt");
const academicModel = require("../models/academic");
const cloudinaryImage = require("../models/cloudinary");
const nodemailer = require("nodemailer");
const cheerio = require("cheerio");
const academicDetails = academicModel.academicDetails;
exports.createUser = async (req, res) => {
  let user = new User(req.body);
  const hash = bcrypt.hashSync(req.body.password, 10);
  user.password = hash;
  user
    .save()
    .then((doc) => {
      let message = "Created Succesfully";
      res.status(201).json({ doc, message });
    })
    .catch((err) => {
      console.log(err);
      let message;
      if (err.code === 11000 && err.keyPattern.email) {
        message = "Email Already Exists";
        res.status(400).json({ err, message });
      } else {
        message = "Can Not Create";
        res.status(400).json({ err, message });
      }
    });
};
exports.getAllUsers = async (req, res) => {
  try {
    let userId = req.userId;
    console.log(userId);

    // Fetch the user document
    let user = await User.findById(req.userId).select("-token -password");
    console.log(user.userRole);
    
    
    // Fetch the course details based on the courseCodes stored in the user document
    if (user.userRole === "admin") {
      console.log("Returning Full data");
      // Fetch all user documents with populated courses
      const allUsers = await User.find().select("-token -password");
      const populatedAllUsers = await Promise.all(
        allUsers.map(async (user) => {
          const populatedCourses = await Promise.all(
            user.courses.map(async (courseCode) => {
              const course = await Course.findOne({ courseCode });
              return course;
            })
          );

          return {
            ...user.toObject(),
            courses: populatedCourses,
          };
        })
      );

      res.status(202).json({ doc: populatedAllUsers });
    } else {
      const populatedCourses = await Promise.all(
        user.courses.map(async (courseCode) => {
          const course = await Course.findOne({ courseCode });
          return course;
        })
      );
  
      // Merge the user document with the populated course details
      const populatedUser = {
        ...user.toObject(),
        courses: populatedCourses,
      };
      console.log("Returning Particular data");
      res.status(202).json({ doc: [populatedUser] });
    }
  } catch (err) {
    const message = "Couldn't Send Data ";
    res.status(400).json({ err, message });
  }
};
exports.getUser = async (req, res) => {
  if (req.params.search) {
    const searchParam = req.params.search;
    const user = await User.aggregate([
      {
        $match: {
          $or: [
            { firstName: { $regex: searchParam, $options: "i" } },
            { lastName: { $regex: searchParam, $options: "i" } },
            { email: { $regex: searchParam, $options: "i" } },
            { userRole: { $regex: searchParam, $options: "i" } },
          ],
        },
      },
      {
        $lookup: {
          from: "academicdetails",
          localField: "_id",
          foreignField: "userEmail",
          as: "academicDetails",
        },
      },
      {
        $project: {
          token: 0,
        },
      },
    ]).exec();
    if (user.length != 0) {

      res.status(200).json(user);
    } else res.status(404).send("No user Found");
  } else {
    res.status(400).send("No parameter given for searching");
  }
};

exports.searchUser = async (req, res) => {
  try {
    if (req.query) {
      console.log(req.query);
      if (req.query.key && req.query.value) {
        console.log(req.query.key, req.query.value);

        const user = await User.aggregate([
          {
            $match: {
              [req.query.key]: { $regex: req.query.value, $options: "i" },
              //for exact match use this instead
              // [req.query.key]:{$regex:new RegExp('^'+req.query.value+'$',"i")}
            },
          },
        ]);
        if (user.length > 0) {
          const message = "User Found";
          res.status(200).json({ user, message });
        } else {
          const message = "User Not found";
          res.status(404).json({ message });
        }
      }
    } else {
      res.status(400).send("No Query");
    }
  } catch (err) {
    console.log("Error", err);
    res.status(400).send(err);
  }
};

exports.updateUser = async (req, res) => {
  console.log("Request Received");
  console.log(req.params.email);
  let user = await User.findOne({ email: req.params.email });
  try {
    if (user) {
      let message = "Updated Succesfully";
      let doc = await User.findOneAndUpdate(
        { email: req.params.email },
        req.body,
        {
          returnDocument: "after",
        }
      );
      res.status(201).json({ doc, message });
    } else if (!user) {
      res.status(404).send("User Does Not Exist");
    }
  } catch (err) {
    let message = "Authorization Error";
    console.log(err);
    res.status(401).json({ err, message });
  }
};
exports.replaceUser = async (req, res) => {
  let email = req.params.email;
  let user = await User.findOne({ email: email });

  try {
    if (user && user._id.toString() == req.userId) {
      let doc = await User.findOneAndReplace({ email: email }, req.body, {
        returnDocument: "after",
      });
      const message = "Replaced Succesfully";
      res.status(204).json({ doc, message });
    } else if (!user) {
      res.status(404).send("User Does Not Exist");
    } else {
      let message = "Can Not Replace Another User";
      res.status(401).send(message);
    }
  } catch (err) {
    const message = "Authentication Error ";
    res.status(401).json({ err, message });
  }
};
exports.deleteSelectedUser = async (req, res) => {
  try {
    const email = req.body;
    if (email.length == 0) {
      const message = "Select a user to delete";
      res.status(400).json({ message });
      return;
    }
    let doc = await User.deleteMany({ email: { $in: email } }).exec();
    console.log(doc.deletedCount);
    const message = `Deleted ${doc.deletedCount} Entries`;
    res.status(200).json({ message });
  } catch (err) {
    console.log(err);
    res.status(400).json({ err });
  }
};
exports.deleteUser = async (req, res) => {
  const email = req.params.email;
  const user = await User.findOne({ email: email });

  try {
    if (user && user._id.toString() == req.userId) {
      let doc = await User.findOneAndDelete({ email });
      let message = "Deleted Succesfully";
      res.status(200).json({ doc, message });
    } else if (!user) {
      res.status(404).send("User Does Not exist");
    } else {
      res.status(401).send("can not update another user");
    }
  } catch (err) {
    let message = "Can Not delete";
    res.status(404).json({ err, message });
  }
};
exports.uploadProfilePic = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    const { image } = req.body;
    console.log("Image:", image);

    const uploadResult = await cloudinaryImage.uploader.unsigned_upload(
      image,
      "user_profile",
      {
        allowed_formats: ["png", "jpg", "jpeg", "ico", "webp"],
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      }
    );
    const URL = uploadResult.url;
    user.profilePic = URL;
    await user.save();
    const message = "Profile Pic Uploaded Successfully";
    res.status(200).json({ message });
  } catch (error) {
    console.error("Error:", error);
    res.status(400).json({ message: error });
  }

  /*
    if(!req.file){
        res.status(400).send("No file is submitted");
    }

    const userId = req.userId;
    const user = await User.findById(userId);

    if(!user){
        res.status(404).send("User not found")
    }
    console.log(req.file);
    const fileName = req.fileName;
    const imagePath = path.join('/images/', fileName);

    user.profilePic = `http://localhost:8080${imagePath}`;
    await user.save();
    res.status(200).send("ProfilePic Saved Succesfully")
    */
};

exports.addAcademicDetails = async (req, res) => {
  
  try{
    console.log("Request Received");
    console.log(req.body);
    const userEmail = req.userEmail
    const message = "Request Received"
    const details = new academicDetails({
      userEmail:userEmail,
      ...req.body
    })

    details.save().then((doc)=>{
      res.status(200).json({doc,message});
     }).catch((err)=>{
      const message= "an error occurred"
      console.log(err);
      res.status(400).json({err,message})
     })
    
  }
  catch(err){
    console.log(err);
    res.status(400).json({err});
  }


    
};
exports.getAcademicDetails = async (req, res) => {
  try {
    const userRole = req.userRole;
    if (userRole.toLowerCase() === "admin") {
      const user = await User.aggregate([
        {
          $lookup: {
            from: "academicdetails",
            localField: "email",
            foreignField: "userEmail",
            as: "academicDetails",
          },
        },
      ]).exec();
      const message = "Returning full data"
      res.status(200).json({user,message});
    } else {
      const user = await User.aggregate([
        {
          $match: { _id: req.userId },
        },
        {
          $lookup: {
            from: "academicdetails",
            localField: "email",
            foreignField: "userEmail",
            as: "academicDetails",
          },
        },
      ]).exec();
      const message = "Returning only one data"
      res.status(200).json({user,message})
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
};
exports.registerForExam = async(req,res)=>{
  try{
    
    const userId = req.userId
    const user = await User.findById(userId);
    console.log(user.isRegisteredForExam);
    if(!user.isRegisteredForExam){
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'benny.keeling6@ethereal.email',
            pass: '4peCbjunNAXpUKFkMH'
        }
    });

      const mailOptions = {
        from: '"Maddison Foo Koch 👻" <benny.keeling6@ethereal.email>',
        to: user.email,
        subject : "Registered for exam",
        text: "You have successfully registered for exam"
      }

      transporter.sendMail(mailOptions,(err,info)=>{
        if(err){
          console.log("Error in sending email", err);
          res.status(400).json({err});
        }
        else{
          console.log("Email sent" + info.response);
          res.status(200).json({message:"Registered Succesfully"})
        }
      })
      
      user.isRegisteredForExam = true;
      await user.save();
    }
  }
  catch(err){
    res.status(400).json({err});
  }
}

exports.references = async(req,res)=>{
  const query = req.query.query;
  console.log(query)
  try{
    const result = await searchOnInternet(query);
    res.status(200).json({result});
  }
  catch(err){
      console.log("Error searching on the internet:", err);
      res.status(500).json({ error: "Internal server error" });
  }
}

async function searchOnInternet(query) {
  const searchEngineUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  const response = await fetch(searchEngineUrl);
  const html = await response.text();
  const $ = cheerio.load(html);
  const results = [];

  $("a").each((index, element) => {
      const url = $(element).attr("href");
      const title = $(element).text();
      console.log("url",url);
      results.push({ url, title });
      
  });

  return results;
}