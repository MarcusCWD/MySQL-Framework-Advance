const express = require("express");
const router = express.Router();

// we get the model of Product from models -> index.js
const { Product } = require("../models");

// import in the Forms
const { bootstrapField, createProductForm } = require('../forms');

// now we can create the route
router.get('/', async (req,res)=>{
    let products = await Product.collection().fetch();
    res.render('products/index.hbs', {
        'products': products.toJSON() 
    })
})

// CRUD - CREATE
router.get('/create', async (req, res) => {
    const productForm = createProductForm();
    res.render('products/create',{
        'form': productForm.toHTML(bootstrapField)
    })
})

// CRUD - UPDATE
router.post('/create', async (req, res) => {
    console.log('post /create');
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async (form) => {
            const product = new Product(form.data);
            await product.save();
            res.redirect('/products');
        },
        'error': async (form) => {
            res.render('products/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})


module.exports = router;
