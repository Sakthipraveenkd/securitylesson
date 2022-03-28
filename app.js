//jshint esversion:6
require('dotenv').config()
const express =require("express");
const ejs=require("ejs");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const encrypt = require('mongoose-encryption');

const app = express();

mongoose.connect("mongodb://localhost:27017/userDB");


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");

const userSchema=new mongoose.Schema({
  userName:String,
  password:String
});


userSchema.plugin(encrypt, { secret: process.env.SECRET,encryptedFields: ['password'] });


const User=new mongoose.model("User",userSchema);


app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){
  const userId=req.body.username;
  const userPassword=req.body.password;

  const newUser=new User({
    userName:userId,
    password:userPassword
  });
  newUser.save(function(err){
    if(err){
      console.log(err);
    }
    else{
    res.render("secrets");
    }
  });
});

app.post("/login",function(req,res){
const userId=req.body.username;
const password=req.body.password;

User.findOne({userName:userId},function(err,foundUser){
  if(err){
    console.log(err);
  }
  else{
    if(foundUser){
      if(foundUser.password===password){
        res.render("secrets");
      }
    }
  }
});

});










app.listen(3000,function(){
  console.log("port created at 3000");
})
