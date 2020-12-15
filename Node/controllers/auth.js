const {validationResult} = require('express-validator');
const User = require('../Models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



exports.signup = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error("entered data is not correct");
        error.statusCode = 422;
        throw error;
    }
    
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    try {
        const existUser = await User.findOne({email:email});
        if(existUser){
            const error = new Error('E-mail address already exists!')
            error.statusCode = 401;
            throw error;
        }
        const hashedPass = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            name: name,
            password: hashedPass,
        });
        const result = await user.save();

        res.status(201).json({
            message: "user created succesfuly",
            userId: result._id,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statsCode = 500;
        }
        next(err);
    }
};

exports.login = async (req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        errors.statusCode = 401;
        throw errors;
    }
    const email = req.body.email;
    const password = req.body.password;
    try{
           const user = await User.findOne({ email: email });
           if (!user) {
               const error = new Error("email or password is invalid.");
               error.statusCode = 401;
               throw error;
           }
           const doMatch = await bcrypt.compare(password, user.password);

           if (!doMatch) {
               const error = new Error("email or password is invalid.");
               error.statusCode = 401;
               throw error;
           }
           const token = jwt.sign(
               { email: user.email, userId: user._id.toString() },
               "YOURSECRETKEY",
               { expiresIn: "1h" }
           );
           res.status(200).json({
               token: token,
               userId: user._id.toString(),
           });
       }

    catch(err){

        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
        
}
