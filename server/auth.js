const express = require('express');
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
var passport = require('passport')
var LocalStrategy = require('passport-local')
const {db} = require('./connection.js')
const router = express.Router()
router.use(express.json())

module.exports = (db) => {
    router.post('/user', async (req, res) => {
    
        try{
    
    
            
            const hash = await argon2.hash(req.body.password)
    
        
            const newAccount = {
                nickname: req.body.nickname,
                email: req.body.email,
                password: hash,
                disabled: req.body.disabled
    
            }
    
            let collection = await db.collection("users")
            let result = await collection.insertOne(newAccount)
            res.send(result).status(204)
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
              // For JWT-based approach, sign a token here
              res.status(200).json({ message: 'Login successful', user })
        })(req, res, next)
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


