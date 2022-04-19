const express = require('express')
const router = express.Router();

//import in the User model
const { User } = require('../models')

const { createRegistrationForm, bootstrapField } = require('../forms');
const async = require('hbs/lib/async');

router.get('/register', (req,res) => {
    const registerForm = createRegistrationForm()
    res.render('users/register.hbs',{
        'form': registerForm.toHTML(bootstrapField)
    })
})

router.post('/register', (req,res)=>{
    const registerForm = createRegistrationForm();
    registerForm.handle(req,{
        success: async(form)=> {
            const user = new User({
                'username': form.data.username,
                'password': form.data.password,
                'email': form.data.email
            })
            await user.save() // save it to the database organic to the table of users
            req.flash('success_messages', 'User signed up successfully')
            res.redirect('/users/login')
        },
        'error':(form)=>{
            res.render('users/register',{
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})
router.get('/login', (req,res)=>{
    res.render('users/login.hbs')
})
module.exports = router