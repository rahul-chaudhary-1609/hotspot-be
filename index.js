require('dotenv/config')
const express=require('express')
const router=require('./routes')
const {sequelize}=require('./models')

const port=process.env.PORT || 5000;

const app=express();

app.use(express.json());

app.use('/',router);

app.listen(port, async (err)=>{
    if(err){
        console.log("Some Error Occurred",err);
    }
    else{
        console.log(`Server is started successfully at port: ${port}`);        
    }
    // try {
    //     await sequelize.sync({force:true});
    //     console.log("Database synced")
    // } catch (error) {
    //     console.log("Error in database sync",error);
    // }
    try {
        await sequelize.authenticate();
        console.log("Database connected")
    } catch (error) {
        console.log("Error in database connection",error);
    }
})