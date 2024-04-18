// const fs = require("fs");
// const data = JSON.parse(fs.readFileSync("data.json", "utf-8"));
// let products = data.products;
const express = require('express');
const model = require('../models/product');
const Product = model.Product;
const ejs = require('ejs');
const path = require('path')
//Server Side Rendering SSR
exports.getAllProductsSSR = async (req, res) => {
    try {
        const products = await Product.find();
        const html = await ejs.renderFile(path.resolve(__dirname, '../views/index.ejs'), { products });
        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};
exports.getAllProducts = async (req, res) => {
    let query = Product.find();
  
    try {
        if(req.query && req.query.sort && req.query.order && req.query.limit){
            const products = await query.sort({[req.query.sort]:req.query.order}).limit(parseInt(req.query.limit)).exec();
            res.json(products);
        }
        else{
            const products = await query.exec();
            res.json(products);
        }
     
    } catch (error) {
      console.error('Sort error:', error);
      res.status(400).json({ error: 'Invalid sorting parameters' });
    }
};
  
exports.getProduct = async(req,res)=>{
    const id = req.params.id;
    console.log({id});
    let product = await Product.findById(id)
    res.json(product);
}

exports. createProduct = (req,res)=>{
    const product = new Product(req.body);
     product.save().then((doc)=>{
        console.log(doc);
        res.status(200).json(doc);
     }).catch((err)=>{
        console.log("Error",err);
        res.status(400).json(err);
     })
}
exports. updateProduct = async(req,res)=>{
    const id = req.params.id;
    console.log({id});
     // const productIndex = products.findIndex(p=>p.id===id);
    // const product = products[productIndex];
    // products.splice(productIndex,1,{...product,...req.body})
    try{
        let message = "Updated Succesfully"
        let doc = await Product.findOneAndUpdate({_id:id},req.body,{
            returnDocument :'after',
            new : true
        })
        res.status(201).json({doc,message});
    }
    catch(err){
        console.log(err);
        res.status(400).json(err);
    }  
}
exports.replaceProduct=async (req,res)=>{
    const id = req.params.id;
    console.log({id});
    try{
        let doc = await Product.findOneAndReplace({_id:id},req.body,{
            returnDocument :'after',
        });
        res.status(201).json(doc);
    }
    catch(err){
        res.status(400).json(err);
    }
}
exports. deleteProduct = async (req,res)=>{
    const id = req.params.id;
    console.log({id});
    try{
        let doc = await Product.findOneAndDelete({_id:id});
        res.status(200).json({doc:doc,message:"Object Created Succesfully"});
    }
    catch(err){
        console.log(err);
        res.status(400).json(err);
    }
}