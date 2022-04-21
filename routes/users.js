const express = require('express')
const router = express.Router();
const crypto = require('crypto')

// this function helps to do a password hashing with sha256 
const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256')
    const hash = sha256.update(password).digest('base64')
    return hash
}

//import in the User model
const { User } = require('../models')

const { createRegistrationForm, createLoginForm, bootstrapField } = require('../forms');



// to do the registering of users
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
                'password': getHashedPassword(form.data.password),
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

// to do the login of user
router.get('/login', (req,res)=>{
    const loginForm = createLoginForm()
    res.render('users/login.hbs',{
        'form': loginForm.toHTML(bootstrapField)
    })
})
router.post('/login', async(req,res)=>{
    const loginForm = createLoginForm()
    loginForm.handle(req, {
        'success': async (form) =>{
            // similar to mongodb we need to .find to narrow our search
            let user  = await User.where({    //user here will contain the particular id, user, email, password
                'email': form.data.email
            }).fetch({
                require:false 
            })
            // if there is no users of that email from the database, do:
            if(!user){
                req.flash('error_messages', 'Sorry, somehting went wrong. Please try again')
                res.redirect('/users/login')
            }
            // if there is such a email from the database, then do:
            else{
                // check that the password match from the password field
                if(user.get('password') === getHashedPassword(form.data.password)){
                    // login success. email match with the password
                    // now store the session id with the user information
                    req.session.user = {
                        id: user.get('id'),
                        username: user.get('username'),
                        email: user.get('email')
                    }
                    req.flash('success_message', 'Welcome back ' + user.get('username'))
                    res.redirect('/users/profile')

                }
                else{
                    // login is not successful
                    // password do not match the password field
                    req.flash('error_message', 'Sorry, somehting went wrong. Please try again')
                    res.redirect('/users/login')
                }
            }
        },
        'error': (form)=>{
            req.flash('error_message', "There are some problems logging you in. Please fill in the form again")
            // since the user is currently on the users/login page, we need to 'refresh' the form so 
            // we use render to render a new form for them
            res.render('/users/login',{
                'form': form.toHTML(bootstrapField)
            })
        }
 
    })
})

// to do the user's profile
router.get('/profile', (req,res)=>{
    // retrives the user login details from session.user
    const user = req.session.user
    // if there is no user infomation do:
    if(!user){
        req.flash('error_message', 'Sorry, somehting went wrong. Please try again')
        res.redirect('/users/login')
    }
    // if there is user infomation do:
    else{
        res.render('users/profile.hbs',{
            'user': user
        })
    }
})

// to do the log out of the user
router.get('/logout',(req,res)=>{
    req.session.user= null
    req.flash('success_message','goodbye please come again next time!')
    res.redirect('/users/login');
})
module.exports = router