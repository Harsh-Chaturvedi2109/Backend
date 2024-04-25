const mongoose = require("mongoose");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const productRouter = require('./routes/product')
const userRouter = require('./routes/user')
const loginRouter = require('./routes/login');
const courseRouter = require('./routes/course');
require('dotenv').config()
console.log('env', process.env.DB_PASSWORD);
const server = express();
server.use(express.json({limit:"10mb"}))
server.use(express.urlencoded({limit:"10mb",extended:true}))
server.use(express.static('public'));
server.use(cors());
server.use(morgan('default'));
// Connecting to the Database


const uri = 'mongodb+srv://harshchaturvedi2109:Harsh2109@samplecluster.iokns2i.mongodb.net/YourDatabaseName?retryWrites=true&w=majority&appName=SampleCluster';

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 20, // Increase the connection pool size
  socketTimeoutMS: 50000, // Increase the operation timeout to 30 seconds
  connectTimeoutMS: 50000, // Increase the connection timeout to 30 seconds
};

mongoose.connect(uri, options)
  .then(() => console.log('MongoDB Atlas Connected'))
  .catch(err => console.log(err));
// main().catch(err => console.log(err));


// async function main() {
//   await mongoose.connect("mongodb+srv://harshchaturvedi2109:Harsh2109@samplecluster.iokns2i.mongodb.net/YourDatabaseName?retryWrites=true&w=majority&appName=SampleCluster");
//   console.log("Connected to the database");
// }
/*
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ecommerce');
  console.log("Connected to the database");
}
*/

server.use('/login',loginRouter.router);
server.use('/product',productRouter.router);
server.use('/user',userRouter.router);
server.use('/course',courseRouter.router);
server.listen(8080,()=>{
    console.log("Server Started"); 
})
