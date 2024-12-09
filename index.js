import express from "express";
const app=express();
//kyuki engine ka use karenge isliye hata diya import path from "path";

// app.get("/",(req,res)=>{
//     // res.sendStatus(400);
//     // res.json({
//     //     "success":true,
//     //     "prodects": [],
//     // })
//     // res.status(400).send("Meri Marzi")
//     // const pathdega=path.resolve()
//     // res.sendFile(path.join(pathdega ,"./index.html"));
// })
// bcrypt isliye download kara taki passwoed save hone se pehle hide ho jaye kyuki password sidhe database me ja raha tha voh safe nhi hai
//setting engine
app.set("view engine","ejs");
//kisi static file ko access karne ke liye
import path from "path"

//data ko store karana hai database me
import mongoose from "mongoose";
import { name } from "ejs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from  "bcrypt";
app.use(cookieParser());
//connect kara
mongoose.connect("mongodb://localhost:27017",{
    dbName:"backend",
}).then(()=>console.log("database connected")).catch((e)=>console.log(e));

//schema baanaaya
const userSchema= new mongoose.Schema({
    name: String,
    email: String,
    password:String, 
})
//model banayenge
const user=mongoose.model("user",userSchema);

app.use(express.static(path.join(path.resolve(),"./public")));
app.use(express.urlencoded({extended:true}));
app.get("/", async (req,res)=>{
    // console.log(req.cookies)
    const {token} =req.cookies;
    if(token){
        const decode =jwt.verify(token,"sfddsfnml");
        // console.log(decode);
        req.users=await user.findById(decode._id);
        console.log(req.users);
        res.render("logout",{name:req.users.name})
    }
    else{
        res.redirect("/login")
    }
    
})
app.post("/register",async (req,res)=>{
    // console.log(req.body)
    const {name ,email , password }=req.body;
//user exit karta hai ki nhi usske liye tech
    let users =await user.findOne({email})
    if(users){
        // return console.log("register first");
        return res.redirect("/login");
    }
    const hassedpassword=await bcrypt.hash(password,10);
     users= await user.create({
        name,
        email,
        password:hassedpassword,
    })
   const token=jwt.sign({_id:users._id},"sfddsfnml")
//    console.log(token);

    // const users= await user.create({name:req.body.name , email:req.body.email});    
    res.cookie("token",token,{
        httpOnly:true,expires: new Date(Date.now()+60*1000)
    });
    res.redirect("/");
})
app.get("/login",(req,res)=>{
    res.render("login");
})

app.get("/register",(req,res)=>{
    res.render("register");
})

app.post("/login",async (req,res)=>{
    
    const {email , password}=req.body;
    let users=await user.findOne({email});
    if(!users){
       return res.redirect("/register")
    }

    //isliye kiya kyuki bcrypt kara hai apanne const isMatch = users.password===password;
    const isMatch = await bcrypt.compare(password,users.password);

    if(!isMatch)
    {
        return res.render("login",{email ,message:"Incorrect Password"})
    }
    const token=jwt.sign({_id:users._id},"sfddsfnml")
    res.cookie("token",token,{
        httpOnly:true,expires: new Date(Date.now()+60*1000)
    });
    res.redirect("/");
} )

app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
        httpOnly:true,expires: new Date(Date.now())
    });
    res.redirect("/");
})

// app.get("/success",(req,res)=>{
//     res.render("success")
// })
// app.post("/contact", async (req,res)=>{
   
//    await message.create({name:req.body.name , email:req.body.email})
//    res.redirect('/success');
// })

app.listen(5000,()=>{
    console.log("server is running");
})