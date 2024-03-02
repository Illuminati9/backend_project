const express = require('express');
const { connectToDatabase } = require('./config/database');
const app = express();
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const cors = require("cors");


const userRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const fileparser = require('./config/parseFile');

require('dotenv').config({ path: '.env' })

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload({ useTempFiles: true,tempFileDir: 'tmp/',}));

app.set('json spaces', 5);

app.get('/api/v1/', (req, res) => {
  res.status(200).json({
    message: "Welcome to the API"
  })
})

app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);

connectToDatabase();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
