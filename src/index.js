const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())

// import routes
const authRoute = require('./Routes/auth')

app.use('/api/auth', authRoute)

app.all('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Page not found' })
})
module.exports = app
