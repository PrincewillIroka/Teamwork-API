const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { pool } = require('./config')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

const server = app.listen(process.env.APP_PORT || 3002, () => {
  console.log(`Server listening on ${process.env.APP_PORT}`)
})

module.exports = server
