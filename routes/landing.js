// LANDING.JS is for storing all the landing page routes

const express = require("express")
// 1. create new express router
const router = express.Router();

// 2. add a new route to the express router
router.get('/', (req,res)=>{
    res.render('landing/index.hbs')
})

// 3. export the router
module.exports = router