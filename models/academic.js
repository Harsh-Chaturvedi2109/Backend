const mongoose = require('mongoose')
const {Schema} = mongoose
const academicSchema = new Schema({
    userEmail:{
        type: String,
        required:true,
        ref:'User'
    },
    higherSecondary:{
        passingYear:{type:Number, required:true},
        percentage:{type:Number, required:true}
    },
    seniorSecondary:{
        passingYear:{type:Number, required:true},
        percentage:{type:Number, required:true}
    },
    fieldOfStudy:{
        type:String,required:true
    },
    graduation:{
        passingYear:{type:Number, required:true},
        percentage:{type:Number, required:true}
    },
    postGraduation:{
        passingYear:{type:Number},
        percentage:{type:Number}
    }
})

exports.academicDetails = mongoose.model('academicDetails',academicSchema);