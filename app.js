//jshint esversion:6
require('dotenv').config()
const express =require("express");
const ejs=require("ejs");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

mongoose.connect("mongodb://localhost:27017/userDB");


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");

const userSchema=new mongoose.Schema({
  userName:String,
  password:String
});


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

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      // Store hash in your password DB
      const newUser=new User({
        userName:req.body.username,
        password:hash
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
      bcrypt.compare(password, foundUser.password, function(err, result) {
      // result == true
      if(result===true){
            res.render("secrets")
      }
  });
    }
  }
});

});










app.listen(3000,function(){
  console.log("port created at 3000");
})
