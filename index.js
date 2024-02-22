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

require('dotenv').config({path: '.env'})

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.set('json spaces', 5);

app.use('/api/v1/auth',userRoutes);
app.use('/api/v1/profile', profileRoutes);

app.get('/', (req, res) => {
  res.send(`
    <h2>File Upload With <code>"Node.js"</code></h2>
    <form action="/api/upload" enctype="multipart/form-data" method="post">
      <div>Select a file: 
        <input name="file" type="file" />
      </div>
      <input type="submit" value="Upload" />
    </form>

  `);
});

app.post('/api/upload', async (req, res) => {
  await fileparser(req)
  .then(data => {
    res.status(200).json({
      message: "Success",
      data
    })
  })
  .catch(error => {
    res.status(400).json({
      message: "An error occurred.",
      error
    })
  })
});

connectToDatabase();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
