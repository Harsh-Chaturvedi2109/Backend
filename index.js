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

const corsOptions = {
  origin: '*', // Or specify allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Add any methods you need
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed request headers
  exposedHeaders: ['Authorization'], // Headers that clients can access in the response
};

server.use(cors(corsOptions));

server.use(morgan('default'));
// Connecting to the Database

main().catch(err => console.log("Error", err));

async function main() {
  await mongoose.connect(process.env.URI);
  console.log("Connected to the database");
}
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
