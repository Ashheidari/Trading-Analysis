const jwt = require('jsonwebtoken');

module.exports = (req, res, next)=>{

  const token =  req.get('Authorization').split(' ')[1];
  try {

    decodedToken = jwt.verify(token,'YOURSECRETKEY');
  } catch (err){
      err.statusCode = 500;
      throw err;
  }

  if(!decodedToken){
      const error = new Error('not authenticated');
      error.statusCode = 401;
      throw error;
  }
  
  req.userId = decodedToken.userId;

  next();

}