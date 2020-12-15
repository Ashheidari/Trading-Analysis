const path = require('path');
const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const Socket = require('./socket');


const app = express();
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');


const fileStorage = multer.diskStorage({
  destination : (req,file,cb) =>{
    cb(null,'images');
  },
  filename: (req,file,cb) => {
    cb(null, uuidv4() +' '+ file.originalname);
  }
});

const fileFilter = (req , file ,cb) =>{
  if (
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg"
  ) {
    cb(null,true);
  }
  else {
    cb(null,false);
  }
}

app.use(bodyparser.json())
app.use(multer({storage:fileStorage, fileFilter:fileFilter}).single('image'));
app.use('/images',express.static(path.join(__dirname,'images')));


app.use((req, res, next)=> {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.removeHeader('X-Powered-By');
    next();
  });


app.use('/auth',authRoutes);
app.use('/feeds',feedRoutes);
app.use('/user',userRoutes);





app.use((error,req,res,next)=>{
  console.log(error);
  statusCode = error.statusCode ||500;
  res.status(statusCode).json({
      message: error.message,
  });

})

mongoose.connect('mongodb+srv://YOURUSERNAME:YOURPASSWORD@test-ru3bx.mongodb.net/test?retryWrites=true&w=majority',
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false


})
.then(result => {

//console.log(result);
 const server = app.listen(8080);

Socket.init(server);
Socket.getIo().on('connection', socket=>{
   console.log('client connected');
 });


}).catch(err=>{
  console.log(err);
});

