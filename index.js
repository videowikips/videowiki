const express = require('express')
const path = require('path')

const app = express()

// setup static content path
app.use(express.static(path.resolve(__dirname, 'public')))

app.listen(4000, () => {
  console.log('Magic happens at http://localhost:4000')
})
