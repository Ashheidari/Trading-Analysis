const express = require('express');
const {body} = require('express-validator');
const authController = require('../controllers/auth');
const User = require('../Models/User');


const router = express.Router();

//PUT=> /auth/signup/
router.put('/signup',[
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
    

    body('name').trim().not().isEmpty(),

    body('password').trim().isLength({min:5}),

    body('confirmPass').custom((value,{req})=>{
        if(value !== req.body.password){
            throw new Error('passwords have to match');
        }
        return true;
    })
],authController.signup);


//POST=> /auth/login


router.post('/login',
// [body('email').isEmail()
// .withMessage('please enter a valid email')
// .custom((value,{req})=>{
//   return User.findOne({email:value}).then(user=>{
//         if (!user){
//             return Promise.reject('E-mail or password is not correct!')
//         }
//     })
// }),
body('password').trim().isLength({min:5}),authController.login)

module.exports = router;