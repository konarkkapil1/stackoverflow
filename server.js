const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyparser = require('body-parser')
const passport = require('passport');
const cors = require('cors');

//middleware for bodyparser
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
//middleware for cors
app.use(cors());

//database connection
const { mongoUrl } = require('./setup/myurl');
mongoose.connect(mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    console.log('database connected');
})
.catch(error => console.log(error))


//middlewares
app.use(passport.initialize());
//config for jwt strategy
require('./strategies/jsonwtStrategy')(passport);


//all routes
const auth = require("./routes/api/auth");
const profile = require("./routes/api/profile")
const questions = require("./routes/api/questions");

//sample testing route
app.get('/',(req,res)=>{
    res.send(`<h1>app working</h1>`);
})

//actual routes
app.use('/api/auth',auth);
app.use('/api/profile',profile);
app.use('/api/questions',questions);


const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`app running on port ${PORT}`);
})