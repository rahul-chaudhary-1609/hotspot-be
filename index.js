require('dotenv/config')
const express=require('express')
const router=require('./routes')
const model=require('./models')

const port=process.env.PORT || 5000;

const app=express();

app.use(express.json());

app.use('/',router);

app.listen(port,(err)=>{
    if(err){
        console.log("Some Error Occurred",err)
    }
    else{
        console.log(`Server is started successfully at port: ${port}`)
    }
})