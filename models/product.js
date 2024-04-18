const mongoose = require("mongoose");
const { Schema } = mongoose;
// Creating Schema
const productSchema = new Schema({
    title:{type:String,required:true,unique:[true,'Title Already Exists']},
    description: String,
    price: {type:Number,required:true},
    discountPercentage: Number,
    rating: {type:Number,min:[0,'can not be this low'],max:[5,'can not be higher than 5']},
    brand: {type:String, required:true },
    category: String,
    thumbnail: {type:String, required:true},
    images : [String]
});
// Creating Model of schema
exports.Product = mongoose.model('Product',productSchema);