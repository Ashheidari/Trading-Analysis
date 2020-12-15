const fs = require('fs');
const path = require('path');
const {validationResult} = require('express-validator');
const Post = require('../Models/Post');
const User = require('../Models/User');
const Socket = require('../socket');


exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    try {
        totalItems = await Post.find().countDocuments();
        const posts = await Post.find().populate('creator').sort({createdAt:-1})
            .skip((currentPage - 1) * perPage)
            .limit(perPage);
        res.status(200).json({
            message: "posts fetched succesfuly",
            posts: posts,
            totalItems: totalItems,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};


exports.createPost = async (req, res, next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        const error = new Error('entered data is not correct');
        error.statusCode = 422;
        throw error;
    }
    if (!req.file){
        const error = new Error('image not found');
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path.replace('\\','/');
    const title = req.body.title;
    const content = req.body.content;
    

    // create post in db
    let creator;
    const post = new Post({
        title : title,
        imageUrl: imageUrl,
        content: content,
        creator: req.userId,
    });

    try{

     await post.save();                   
     user = await User.findById(req.userId);
     user.posts.push(post);
     await user.save();
     Socket.getIo().emit('posts', {action:'create', post:{...post, creator:{_id : req.userId, name : user.name}}});   
     res.status(201).json({
            message: "post created succesfuly",
            post: post,
            creator: {_id : user._id, name:user.name}
                    });
    }

    catch(err){

        if (!err.statusCode) {
            err.statusCode = 500;
        }
             next(err);
    }
        
   
}


exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;

    try {
        const post =  (await Post.findById(postId))
        console.log(post);
        if (!post) {
            const error = new Error("post not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            message: "post fetched",
            post: post,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};


exports.updatePost = async (req, res, next) =>{
const postId = req.params.postId;
const errors = validationResult(req);
if(!errors.isEmpty()){
    const error = new Error('entered data is not correct');
    error.statusCode = 422; 
    throw error;
}
const title = req.body.title;
const content = req.body.content;
let imageUrl = req.body.image;

if (req.file) {
    imageUrl = req.file.path.replace('\\','/');
}

try{
    const post = (await Post.findById(postId))
    
        if (!post){
            const error = new Error('post not found');
            error.statusCode = 404;
            throw error;
        }
        if (post.creator._id.toString() !== req.userId){
            const error = new Error ('not authorized');
            error.statusCode = 403;
            throw error;
        }
        if (imageUrl!== post.imageUrl){
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        const updatedPost = await post.save();

        Socket.getIo.emit('posts',{action:'update', post:updatedPost});
        res.status(200).json({
            message : 'post updated successfuly',
            post : updatedPost
        })
        
}


    catch(err){
        if (!err.statusCode){
        err.statusCode(500);
    }
    next(err);
}

}



exports.deletePost = async (req, res, next)=>{
    const postId = req.params.postId;
    try{
    const post = await Post.findById(postId)
    
        if(!post){
            const error = new Error('post not found')
            error.statusCode = 404;
            throw error
        }
        //check user create that post;
        if (post.creator.toString() !== req.userId){
            const error = new Error ('not authorized');
            error.statusCode = 403;
            throw error;
        }
        clearImage(post.imageUrl);

            await Post.findByIdAndRemove(postId);
    
            
    
            const user = await User.findById(req.userId)
            user.posts.pull(postId)
            await user.save();
            Socket.getIo.emit('posts',{action:'delete',post:postId});
            res.status(200).json({
                message : 'post deleted succesfuly'
             })
            
        }

    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;

        }
        next(err);
    }
}

const clearImage = (imageUrl) =>{

    filePath = path.join(__dirname,'..',imageUrl);
    fs.unlink(filePath, err => {
        console.log(err);
    });
}