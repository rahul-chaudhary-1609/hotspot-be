require('dotenv/config');
const express=require('express')
const router=require('./routes')
const { sequelize } = require('./models')
const { QueryTypes } = require('sequelize')
const cors=require("cors");
const cookieSession = require('cookie-session');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const bodyParser = require('body-parser');
const port=process.env.PORT || 5000;

const app=express();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));

app.use(cors());


app.use(express.json());

app.use('/apiDocs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { swaggerOptions: { docExpansion: "none"}}));
app.use('/',router);

// // For an actual app you should configure this with an experation time, better keys, proxy and secure
// app.use(cookieSession({
//     name: 'hotspot',
//     keys: ['key1', 'key2']
//   }))


app.listen(port, async (err)=>{
    if(err){
        console.log("Some Error Occurred",err);
    }
    else{
        console.log(`Server is started successfully at port: ${port}`);        
    }
    try {
        //await sequelize.query("CREATE EXTENSION postgis;", { type: QueryTypes.CREATE });
        await sequelize.sync({alter:true});
        console.log("Database synced")
    } catch (error) {
        console.log("Error in database sync",error);
    }
    try {
        await sequelize.authenticate();
        console.log("Database connected")
    } catch (error) {
        console.log("Error in database connection",error);
    }
})