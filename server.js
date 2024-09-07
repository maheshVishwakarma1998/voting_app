const express = require('express')
const app = express();
const db = require('./db');
require('dotenv').config();
const {jwtAuthMiddleware, } = require('./jwt');


const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // req.body
const PORT = process.env.PORT || 3000;

app.get('/', function (req, res) {
    res.send('Welcome to our Voting App');
})


// Import the router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

// Use the routers
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);
  
app.listen(PORT, ()=>{
    console.log('listening on port 3000');
})