const path = require('path')

module.exports = (app, passport) => {
  // server routes ===========================================================
  // handle things like api calls
  // authentication routes
  app.use('/api/auth', require('./routes/auth')(passport))

  // frontend routes =========================================================
  app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public', 'index.html'))
  })
}
