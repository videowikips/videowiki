const path = require('path')

module.exports = (app, passport) => {
  // server routes ===========================================================
  // handle things like api calls
  // authentication routes
  app.use('/api/auth', require('./routes/auth')(passport))
  app.use('/api/wiki', require('./routes/wiki')())
  app.use('/api/upload', require('./routes/upload')())
  app.use('/api/articles', require('./routes/articles')())
  app.use('/api/users', require('./routes/users')())
  app.use('/api/slackEmail', require('./routes/slackEmail')())

  // frontend routes =========================================================
  app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public', 'index.html'))
  })
}
