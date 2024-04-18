const express = require("express");
const productController = require("../controller/product")
const router = express.Router()

router.get("/", productController.getAllProducts)
.get("/ssr",productController.getAllProductsSSR)
.get("/:id", productController.getProduct)
.post("/",productController.createProduct)
.patch('/:id',productController.updateProduct)
.put('/:id',productController.replaceProduct)
.delete('/:id',productController.deleteProduct)

exports.router = router;