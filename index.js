require('dotenv/config');
const express=require('express')
const router=require('./routes')
const { sequelize } = require('./models')
const cors=require("cors");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;
const cronJob = require("./utils/cronJob");

const app=express();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));

app.use(cors());


app.use(express.json());


app.get('/', (req, res) => {
    res.send("<center><p><b>Welcome to Hotspot!</b></p></center>");
});

app.use('/apiDocs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { swaggerOptions: { docExpansion: "none"}}));

// app.use('/',router);
require("./routes")(app);



app.listen(port, async (err)=>{
    if(err){
        console.log("Some Error Occurred",err);
    }
    else{
        console.log(`Server is started successfully at port: ${port}`);        
    }
    try {
        await sequelize.sync({alter:true});
        console.log("Database synced Success")
        await cronJob.scheduleRestaurantOrdersEmailJob()
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