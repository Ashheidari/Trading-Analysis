const express = require('express');
const {body} = require('express-validator');

const router = express.Router();
const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');

router.get('/status',isAuth,userController.getUserStatus);


router.patch('/status',isAuth,[body('status').trim().not().isEmpty()],userController.updateUserStatus);

module.exports = router;