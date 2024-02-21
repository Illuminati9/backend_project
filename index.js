const express = require('express');
const { connectToDatabase } = require('./config/database');
const app = express();
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const cors = require("cors");


const userRoutes = require('./routes/auth');

require('dotenv').config({path: '.env'})

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());


app.use('/api/v1/auth',userRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

connectToDatabase();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
