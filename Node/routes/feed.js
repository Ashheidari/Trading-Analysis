const express = require('express');
const {body} = require('express-validator')

const isAuth = require('../middleware/is-auth');
const feedController = require('../controllers/feed');


const router = express.Router();

//fetch posts//GET=> /feeds/posts
router.get('/posts',isAuth ,feedController.getPosts);


//create post//POST=> /feeds/post
router.post('/post', isAuth ,
[
    body('title').trim().isLength({min: 5}),
    body('content').trim().isLength({min:5})

],feedController.createPost);

//fetch a post//GET=> /feeds/post/:id
router.get('/post/:postId',isAuth,feedController.getPost);

//update post//PUT=> /feeds/post/:id
router.put('/post/:postId',isAuth,[
    
    body('title').trim().isLength({min:5}),
    body('content').trim().isLength({min:5})
],feedController.updatePost);

//delete post//DELETE=> /feeds/post/:id
router.delete('/post/:postId',isAuth,feedController.deletePost);


module.exports = router