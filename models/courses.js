const mongoose = require('mongoose');
const {Schema} = mongoose;

const courseSchema = new Schema({
    title:{type:String,required:true,unique:[true,'Course Already Exists']},
    courseCode:{type:String,required:true,unique:[true,'Course Already Exists']},
    duration:{type:String},
    credits:{type:Number}, 
    Field:{type:String}
})

exports.Course = mongoose.model('Course',courseSchema)