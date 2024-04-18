const jwt = require('jsonwebtoken');
const fs = require('fs');
const model = require("../models/user");
const User = model.User;
const mongoose = require('mongoose');

const publicKey = fs.readFileSync('./public.key','utf-8');
const auth = async (req,res,next)=>{
    try{
      const token = req.get('Authorization').split(' ')[1];
      console.log(token);
      
      // console.log(process.env.SECRET);
      var decoded = jwt.verify(token, publicKey,{ algorithm: 'RS256' });
      if(decoded && decoded.email ){
        console.log(decoded);
        console.log(decoded.email);
        const user = await User.findOne({email:decoded.email}).select('_id userRole').exec();
        if(user){
            req.userId = user._id;
            req.userRole = user.userRole;
            req.userEmail = decoded.email
            next()
        }
        else{
            res.status(401).send("Authentication Error");
        }
      }
      else{
            let message ="User Not Found"
            res.status(404).json({message});
      }
    }
    catch(err){
      if (err.name === 'TokenExpiredError') {
        let message = "Token Expired. Please log in again.";
        res.status(401).json({ message });
    } else {
        console.log(err);
        let message = "Authentication Error";
        res.status(401).json({ message });
    }
    }
   
  }

exports.auth = auth