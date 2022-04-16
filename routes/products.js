const express = require("express");
const async = require("hbs/lib/async");
const router = express.Router();

// we get the model of Product from models -> index.js
const {Product} = require ('../models')

// import forms
const {bootstrapField, createPorductForm} = require('../forms')


// now we can create the route
router.get('/', async(req,res)=>{
    let products = await Product.collection().fetch();

    res.render('products/index.hbs', {
        'products': products.toJSON()
    })
})

// CRUD - CREATE
router.get('/create', async(req, res)=>{
    const productForm = createPorductForm();
    res.render('products/create', {
        'form': productForm.toHTML (bootstrapField)
    })
})

// CRUD - UPDATE
router.post('/create', async())


module.exports = router;