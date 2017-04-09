// modules =================================================
const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const passport = require('passport')
const expressSession = require('express-session')
const flash = require('connect-flash')
const path = require('path')

const app = express()

// configuration ===========================================
const initPassport = require('./controllers/passport/init')

// config files
const config = require('./config')

const port = process.env.PORT || 4000 // set our port
mongoose.connect(config.db) // connect to our mongoDB database //TODO: !AA: Secure the DB with authentication keys

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()) // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })) // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })) // parse application/x-www-form-urlencoded
app.use(morgan('dev')) // use morgan to log requests to the console
app.use(methodOverride('X-HTTP-Method-Override')) // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(path.resolve(__dirname, 'public'))) // set the static files location /public/img will be /img for users

// Passport configuration
app.use(expressSession({ secret: config.secret }))
app.use(passport.initialize())
app.use(passport.session())

app.use(flash()) // Using the flash middleware provided by connect-flash to store messages in session

// Initialize Passport
initPassport(passport)

// routes ==================================================
require('./router/index.js')(app, passport) // pass our application into our routes

// start app ===============================================
app.listen(port)
console.log(`Magic happens on port ${port}`)       // shoutout to the user
exports = module.exports = app             // expose app
