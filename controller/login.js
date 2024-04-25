const model = require("../models/user");
const User = model.User;
const jwt = require('jsonwebtoken');
const fs = require('fs');
const privateKey = fs.readFileSync('./private.key','utf-8');
const bcrypt = require('bcrypt');

exports.login = async(req,res)=>{
   
    try{
        console.log("Email", req.body.email)
        let doc = await User.findOne({email:req.body.email})
        if(doc){
            let isAuth = bcrypt.compareSync(req.body.password, doc.password);
            console.log(isAuth);
            if(isAuth){
                    //Adding Authentication Using JWT
                let token = jwt.sign({ email:req.body.email}, privateKey,{ algorithm: 'RS256',expiresIn: '1h'});
                doc.token = token;
                console.log("Role",doc.userRole);
                const role = doc.userRole;
                const message = "Login Successful"
                res.status(202).json({role,token,message})
                doc.save();
            }
            else{
                const message = "Password is wrong "
                res.status(401).json({message})
            }
    
        }
        else{
            res.status(401).send("Email DoesNot Exist")
        }
       
    }
    catch(err){
        console.log(err);
        const message = "Couldnt Send Data "
        res.status(401).json({err,message})
    }
   
}