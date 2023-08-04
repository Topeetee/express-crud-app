const express = require("express");
const router  = express.Router();
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const validator = require('validator');
const User = require("../models/auth"); // Assuming "auth.js" contains the User model
const { verifyUser } = require("../authUtils");


router.post("/register", async (req, res) => {
  
  async function sendEmail(to, subject, text) {
    return new Promise((resolve, reject) => {
      // Configure the transporter with Gmail SMTP settings
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Set to true if using port 465 with SSL/TLS
        auth: {
          user: process.env.Email,
          pass: process.env.Pass,
        },
      });
  
      const mailOptions = {
        from: process.env.Email,
        to,
        subject,
        text,
      };
  
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          console.log('Email sent: ' + info.response);
          resolve(info);
        }
      });
    });
  }
  
  const { username, password, email } = req.body;
  const subject = 'Welcome to our website';
  const message = `Dear ${email},\n\nThank you for registering on our website. We look forward to having you as a member.\n\nBest regards,\nThe Website Team\n\nSent iwth nodemailer from AkpariJs.You be werey bad guy u don sleep why na`;

  try {
    // Check if user already exists in the database
    const existingUser = await User.findOne({ username });
    const existingEmail = await User.findOne({email})
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    if (existingEmail) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    // Hash the password with bcrypt before saving
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds
    //validate email
    if (validator.isEmail(email)) {
        console.log('Email is valid.');
      }  else {
        const errorMessage = 'Invalid email address';
        return res.status(422).json({ error: errorMessage });
      }
    // Create new user and store in the database
    const newUser = new User({ username, password: hashedPassword,email, isAdmin: false });
    await newUser.save();
    await sendEmail(email, subject, message);
    return res.status(201).json(newUser);
  
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      // Find the user in the database
      const user = await User.findOne({ username });
  
      if (!user) {
        res.send('User not found. Please try again.');
        return;
      }
      // Compare the hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      const payload = {
        userId: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
      };
      const token = jwt.sign(payload, process.env.secret_key, { expiresIn: '1h' });
      if (isPasswordValid) {
        res.json(user);
      } else {
        res.cookie('token', token, {
          httpOnly: true, // The cookie is not accessible through JavaScript
          maxAge: 3600000, // 1 hour in milliseconds
          sameSite: 'strict', // Prevent cross-site request forgery (CSRF) attacks
          secure: true, // Set this to true in production if using HTTPS
        }).send('Invalid credentials. Please try again.');
      }
    } catch (error) {
      res.status(500).send('An error occurred. Please try again later.');
    }
  });
  
router.post("/forgot/:id",async (req, res) => {
  const user = await User.findById(req.params.id);
  const { email } = req.body;
  try {
    if (email !== user.email) {
      res.send("User not registered");
      return;
    }
    
    const payload = {
      userId: user._id,
      username: user.username,
    };
    
    const token = jwt.sign(payload, process.env.secret_key, { expiresIn: '2m' });
    const link = `http://localhost:3000/reset/${user._id}/${token}`;
    
    // Send an email to the user with the password reset link
    await sendEmail(email, "password Reset", `Click the link to reset your password: ${link}`);
    
    
    res.send('Password reset link sent successfully check mail for confirmation' );
  } catch (error) {
    res.status(500).send('An error occurred. Please try again later.');
  }
});

router.get("/reset/:id/:token", (req, res) => {
  const { id, token } = req.params;
  try {
    // Verify the token and show a password reset form
    const payload = jwt.verify(token, process.env.secret_key);

    // Check if the user ID in the token matches the provided ID
    if (payload.userId !== id) {
      return res.status(400).send('Invalid user ID in token');
    }
  } catch (error) {
    // Handle token verification error
    res.status(400).send('Invalid or expired token');
  }
});

router.post("/reset/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password, newPassword } = req.body;
  if(password !== newPassword){
    res.send("password doesn't match")
  }
  try {
    // Verify the token again
    const payload = jwt.verify(token, process.env.secret_key);
    if (payload.userId !== id) {
      return res.status(400).send('Invalid user ID in token');
    }
    // Find the user by ID
    const user = await User.findById(id);

    // Update the user's password with the new password
    // You should hash the new password before updating
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Save the updated user document
    await user.save();

    res.send('Password reset successful');
  } catch (error) {
    // Handle token verification error or other errors
    res.status(400).send('Password reset failed');
  }
});


module.exports = router;
