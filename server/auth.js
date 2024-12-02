const express = require('express')
const dotenv = require('dotenv')
const argon2 = require('argon2')
var jwt = require('jsonwebtoken')
var passport = require('passport')
var LocalStrategy = require('passport-local')
const nodemailer = require('nodemailer');
const {db} = require('./connection.js')
const { ObjectId } = require("mongodb")
const router = express.Router()
router.use(express.json())

dotenv.config({ path: './data/config.env' })
var secret = process.env.JWT_SECRET
const emailSecret = process.env.EMAIL_SECRET;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com.',
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

module.exports = (db) => {
    router.post('/user', async (req, res) => {
    
        try{
            const hash = await argon2.hash(req.body.password)
    
        
            const newAccount = {
                nickname: req.body.nickname,
                email: req.body.email,
                password: hash,
                disabled: req.body.disabled,
                verified: false,
                isAdmin: false
    
            }
    
            let collection = await db.collection("users")
            let result = await collection.insertOne(newAccount)

            const token = jwt.sign({ email: req.body.email }, emailSecret, { expiresIn: '1h' });

            const verificationLink = `http://localhost:3000/auth/verify-email/${token}`;
            const mailOptions = {
                from: emailUser,
                to: req.body.email,
                subject: 'Verify Your Email',
                html: `<p>Click <a href="${verificationLink}">here</a> to verify your email address.</p>`,
            };

            await transporter.sendMail(mailOptions);

            res.status(201).send({ message: 'Account created. Please verify your email.' })
        }
        catch (err){
            console.error("An error occurred:", err);
            res.status(500).send({ err: "Unable to process request" });
        }
    })

    router.post('/login', (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return res.status(500).json({ error: 'Authentication failed' })
              }
              if (!user) {
                return res.status(401).json({ error: info.message })
              }

              if (!user.verified) {
                return res.status(403).json({ error: 'Email not verified.' });
              }
              // For JWT-based approach, sign a token here
              
              var token = jwt.sign(
                { id: user._id, email: user.email },
                secret,
                { expiresIn: '1h' }
              ) 
              
              
              res.status(200).json({ message: 'Login successful', token, userId: user._id, name: user.nickname, isAdmin: user.isAdmin, isDisabled: user.disabled })
        })(req, res, next)
    })

    router.get('/verify-email/:token', async (req, res) => {
        try {
            const { token } = req.params;
            const decoded = jwt.verify(token, emailSecret);

            const collection = await db.collection('users');
            const result = await collection.updateOne(
                { email: decoded.email },
                { $set: { verified: true } }
            )

            if (result.modifiedCount === 0) {
                return res.status(400).send({ message: 'Invalid or expired token.' });
            }

            res.status(200).send({ message: 'Email verified successfully.' });
        } catch (err) {
            console.error('Email verification error:', err);
            res.status(400).send({ message: 'Invalid or expired token.' });
        }
    })

    router.put('/user/admin', async (req, res) => {
        try {
            const { userIds, isAdmin } = req.body; 
    
            if (!Array.isArray(userIds) || typeof isAdmin !== 'boolean') {
                return res.status(400).send({ error: "'userIds' must be an array and 'isAdmin' must be a boolean." });
            }
    

            const objectIds = userIds.map((id) => new ObjectId(id));
    
            const collection = await db.collection('users');
            const result = await collection.updateMany(
                { _id: { $in: objectIds } }, 
                { $set: { isAdmin: isAdmin } } 
            );
    
            if (result.matchedCount === 0) {
                return res.status(404).send({ error: "User not found." });
            }
    
            res.status(200).send({ message: "User's admin status updated successfully." });
        } catch (err) {
            console.error("Error updating isAdmin field:", err);
            res.status(500).send({ error: "Internal server error." });
        }
    })

    router.put('/user/disable', async (req, res) => {
        try {
            const { userIds, disabled } = req.body;


            if (!Array.isArray(userIds) || typeof disabled !== 'boolean') {
            return res.status(400).send({ error: "'userIds' must be an array and 'disabled' must be a boolean." })
            }

            // Convert userIds to ObjectId
            const objectIds = userIds.map((id) => new ObjectId(id))

            const collection = await db.collection('users')
            const result = await collection.updateMany(
            { _id: { $in: objectIds } },
            { $set: { disabled: disabled } }
            )
    

            if (result.matchedCount === 0) {
                return res.status(404).send({ error: "User not found." })
            }
    
            res.status(200).send({ message: `User's disabled status updated to ${disabled}.` })
        } catch (err) {
            console.error("Error updating disabled field:", err)
            res.status(500).send({ error: "Internal server error." })
        }
    })
    router.get('/users', async (req, res) => {

        const collection = await db.collection("users")
        const results = await collection.find({}).toArray()
        res.status(200).send(results)

    })

    router.put('/user/password', async (req, res) => {
        try {
            const { email, oldPassword, newPassword } = req.body;
        
            if (!email || !oldPassword || !newPassword) {
              return res.status(400).send({ error: 'Email, old password, and new password are required.' });
            }
        
            const collection = await db.collection('users');
            const user = await collection.findOne({ email });
        
            if (!user) {
              return res.status(404).send({ error: 'User not found.' });
            }
        
            // Verify the old password
            const isMatch = await argon2.verify(user.password, oldPassword);
            if (!isMatch) {
              return res.status(401).send({ error: 'Old password is incorrect.' });
            }
        
            // Hash the new password and update it in the database
            const hashedPassword = await argon2.hash(newPassword);
            const result = await collection.updateOne(
              { email },
              { $set: { password: hashedPassword } }
            );
        
            if (result.modifiedCount === 0) {
              return res.status(500).send({ error: 'Failed to update password.' });
            }
        
            res.status(200).send({ message: 'Password updated successfully.' });
          } catch (err) {
            console.error('Error updating password:', err);
            res.status(500).send({ error: 'Internal server error.' });
          }
      })
    passport.use(new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
        },
        
        async function verify (email, password, cb) {

            try{
                const collection = await db.collection("users")

                const user = await collection.findOne({email})
            
                if (!user) { return cb(null, false, { message: 'Incorrect email or password.' }) }

                const isMatch = await argon2.verify(user.password, password)
                if (!isMatch) {
                    return cb(null, false, { message: 'Incorrect email or password.' })
                }
                return cb(null, user)
            }
            catch (err) {
                return cb(err)
        }

    }))


    router.use(passport.initialize())

    return router
}


