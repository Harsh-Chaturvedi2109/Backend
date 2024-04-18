const mongoose = require('mongoose');
const{Schema} = mongoose;

const userSchema = new Schema({
        firstName: {type:String,required:true},
        lastName: {type:String,required:true},
        age: {type:Number},
        gender: {type:String,required:true},
        email: {
            type:String,
            required:true,
            unique:[true,'email Already Exists'],
            validate: {
                validator: function(v) {
                  return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
                },
                message: props => `${props.value} is not a valid Email!`
              },
        },
        password: {type:String,minLength:6,required:true},
        phone: {
            type:String,
            required:true
        },
        profilePic : String,
        userRole: String,
        courses:[{type:String,ref:'Course'}],
        isRegisteredForExam:{type:Boolean,default:false},
        token:String
})

exports.User = mongoose.model('User',userSchema);