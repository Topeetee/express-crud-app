const express = require('express');
const app = express();
const mongoose = require("mongoose")
const session = require('express-session');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const port = 3000; // You can choose any port you prefer
const authRoute = require("./routes/auth")

const db = require("./db")


app.use(express.json());
app.use(express.urlencoded({extended:false}))
// Define a route for the root URL
app.use(session({
    secret: 'your_secret_key_here',
    resave: false,
    saveUninitialized: true,
  }));
app.get('/', (req, res) => {
  res.send('Hello, this is a basic Express server!');
});
app.use("/domain",authRoute)
// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
