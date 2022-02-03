require('@babel/register')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../', 'videowiki.env') });

// modules =================================================
const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const passport = require('passport')
const expressSession = require('express-session')
const flash = require('connect-flash')
const scribe = require('scribe-js')()
const cookieParser = require('cookie-parser')
const formData = require('express-form-data')
const os = require('os')
const compression = require('compression')
const websockets = require('./modules/shared/vendors/websockets');
const websocketsEvents = require('./modules/shared/vendors/websockets/events');
const registerSocketHandlers = require('./modules/shared/vendors/websockets/registerHandlers');

const app = express()
const server = require('http').Server(app);


const console = process.console

const formDataOptions = {
  uploadDir: os.tmpdir(),
  maxFieldsSize: 10 * 1024 * 1024,
}

const args = process.argv.slice(2);
const port = args[0];
const lang = args[1];
const DB_CONNECTION_URL = process.env.DB_CONNECTION_URL;
const APP_SECRET = process.env.APP_SECRET;

// Initialize sockets
const socketConnection = websockets.createSocketConnection(server);

socketConnection.on('connection', (socket) => {
  console.log('client connected', socket.id);
  setTimeout(() => {
    console.log('sending heartbeat to ', socket.id);
    socket.emit(websocketsEvents.HEARTBEAT, { hello: 'world' });
  }, 5000);
  registerSocketHandlers.registerHandlers(socket, require('./modules/auth/websocketsHandlers').handlers)
})
// DB Connection and app initializations
mongoose.connect(`${DB_CONNECTION_URL}-${lang}`) // connect to our mongoDB database //TODO: !AA: Secure the DB with authentication keys
console.log(`====== Connected to database ${`${DB_CONNECTION_URL}-${lang}`} ===========`)
app.all('/*', (req, res, next) => {
  // CORS headers - Set custom headers for CORS
  res.header('Access-Control-Allow-Origin', '*'); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token, X-Vw-Anonymous-Id, X-Key, Cache-Control, X-Requested-With');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

app.use(cookieParser())
app.use(bodyParser.json({ limit: '50mb' })) // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })) // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })) // parse application/x-www-form-urlencoded

// parse data with connect-multiparty.
app.use(formData.parse(formDataOptions))
// clear from the request and delete all empty files (size == 0)
app.use(formData.format())
// change file objects to stream.Readable
app.use(formData.stream())
// union body and files
app.use(formData.union())

app.use(morgan('dev')) // use morgan to log requests to the console
app.use(methodOverride('X-HTTP-Method-Override')) // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
// app.use(express.static(path.resolve(__dirname, 'public'))) // set the static files location /public/img will be /img for users
app.use(compression({ threshold: 0 }))
app.use(express.static(path.join(__dirname, '../build')))

// Passport configuration
app.use(expressSession({ secret: APP_SECRET, saveUninitialized: false, resave: false }))

// app.use(scribe.express.logger())

app.use(flash()) // Using the flash middleware provided by connect-flash to store messages in session

// configuration ===========================================
// const initPassport = require('./controllers/passport/init')
// // Initialize Passport
// initPassport(passport)
// app.use(passport.initialize())
// app.use(passport.session())

// app.use('/logs', scribe.webPanel())

// routes ==================================================
require('./router/index.js')(app, passport) // pass our application into our routes
// start autoupdate bot ====================================
require('./bots/autoupdate/init');
// Update namespaces on articles ===== this is temporarely
// require('./controllers/wiki').applyNamespacesOnArticles();
// Start cron jobs
// require('./utils/Schedule')
// start app ===============================================
server.listen(port)
console.log(`Magic happens on port ${port}`)       // shoutout to the user
console.log(`==== Running in ${process.env.ENV} mode ===`)
exports = module.exports = app             // expose app
// applyScriptMediaOnArticleOnAllArticles()
