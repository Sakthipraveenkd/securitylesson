//jshint esversion:6
require('dotenv').config()
const express =require("express");
const ejs=require("ejs");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const app = express();
const session = require('express-session');
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate=require("mongoose-findorcreate");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
//exprress session
app.use(session({
  secret: "this is our little secret.",
  resave: false,
  saveUninitialized: false
}));
//passport doc
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema=new mongoose.Schema({
  username:String,
  password:String,
  googleId:String
});
//passport local mongoose npmjs
userSchema.plugin(passportLocalMongoose);
//fondOrCreate Mongoose npmjs
userSchema.plugin(findOrCreate);

const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support

passport.serializeUser(function(user, cb) {
    cb(null,user.id);
  });

passport.deserializeUser(function(id, cb) {
  User.findById(id,function(err,user) {
  cb(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    //install npm mongoose-findorcreate
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



app.get("/",function(req,res){
  res.render("home");
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ["profile"] }));

app.get('/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/secrets');
    });

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});

app.post("/register",function(req,res){
  //it comes from passport mongoose local npm
 User.register({username:req.body.username},req.body.password,function(err,user){
   if(err){
     res.redirect("/register");
   }else{
     passport.authenticate("local")(req,res,function(){
       res.redirect("/secrets");
     });
   }
 });
});

app.post("/login",function(req,res){

  const user=new User({
    username:req.body.username,
    password:req.body.password
  });
  // passport js doc
req.login(user,function(err){
  if(err){
    console.log(err);
  }else{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/secrets")
    });
  }
});
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});










app.listen(3000,function(){
  console.log("port created at 3000");
})
