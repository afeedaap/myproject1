const express = require('express');
const user_route = express()
const User = require('../model/userModel')
const userController = require("../controller/userController");
const multer = require('../middleware/multer')
const auth = require("../middleware/userAuth")

const config = require('../config/config')
const path = require('path')



const session = require('express-session');

// user_route.use(passport.initialize())
// user_route.use(passport.session())

user_route.use(session({
  secret: 'your_secret_key_here',
  resave: false,
  saveUninitialized: true
}));


user_route.use(express.json());
user_route.use(express.urlencoded({ extended: true }));
user_route.use(express.static(path.join(__dirname, 'public')));


// View engine setup
user_route.set('view engine', 'ejs');
user_route.set('views', './views/user');


user_route.get("/", userController.loadHome)
user_route.get("/home", userController.loadHome)

user_route.get("/product-details", userController.loadProductDetails)


user_route.get('/sign-up', auth.isLogout, userController.loadSignup);




  user_route.get("/success", userController.successLoad)
  user_route.get('/failure', userController.failureLoad)












user_route.post('/sign-up', userController.insertUser)

user_route.get("/profile", auth.isLogin, userController.profileLoad)
user_route.post('/edit-profile',multer.uploadProfile.single('image'),userController.editProfile)

user_route.get('/logout', auth.isLogin, userController.logoutUser)



user_route.get('/otp', userController.otpLoad);
user_route.post('/verify-otp', userController.verifyOtp);
user_route.get('/resend-otp', auth.isLogout, userController.resendOtp);

user_route.get('/login', auth.isLogout, userController.loadLogin);
user_route.post('/login', userController.verifyLogin);



module.exports = user_route;
