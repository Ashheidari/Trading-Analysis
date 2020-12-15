const User = require('../Models/User');

exports.getUserStatus = async (req, res, next) =>{
    const user = await User.findById(req.userId)
    try{

        if(!user){
            const error = new Error('user not found');
            error.satusCode = 404;
            throw error;
        }
        res.status(200).json({
            message:'user fetched successfuly',
            user : user
        })
    }



    catch(err){

        if (!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
    

}

exports.updateUserStatus = async (req, res, next)=>{
    const newStatus = req.body.status;

    try{

        const user = await User.findById(req.userId);
        if (!user) {
            const err = new Error("user not found");
            err.statusCode = 404;
            throw err;
        }

        user.status = newStatus;
        await user.save();

        res.status(200).json({
            message: "user status changed",
        });
    }
        catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }

}