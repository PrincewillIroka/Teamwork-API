const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { pool } = require('../config')
const jwtVerification = require('./jwt-verify')
const authRoutes = express.Router()
const SALT_WORK_FACTOR = 10
const jwtKey = 'securesecretkey'
const jwtExpirySeconds = 300

authRoutes.route('/create-user').post(function(request, response) {
  let status = {}
  const {
    firstName,
    lastName,
    email,
    password,
    gender,
    jobRole,
    department,
    address,
    token
  } = request.body

  if (jwtVerification(token)) {
    status = {
      status: 'error',
      error: 'Unauthorized access'
    }
    response.status(400).json(status)
    return
  }

  const accessLevel = 'employee'
  const userId = Number(
    new Date()
      .valueOf()
      .toString()
      .substring(0, 7)
  )

  const sqlQuery = {
    text: 'SELECT * FROM users WHERE email = $1',
    values: [email]
  }
  pool.query(sqlQuery, (error, result) => {
    if (error) {
      status = {
        status: 'error',
        error: 'An error occured'
      }
      response.status(200).json(status)
    } else if (result.rows.length > 0) {
      status = {
        status: 'error',
        error: 'User already exists'
      }
      response.status(200).json(status)
    } else {
      bcrypt.genSalt(SALT_WORK_FACTOR, function(error, salt) {
        if (error) {
          status = {
            status: 'error',
            error: 'An error occured'
          }
          response.status(200).json(status)
        } else {
          // hash the password along with our new salt
          bcrypt.hash(password, salt, async function(error, hash) {
            if (error) {
              status = {
                status: 'error',
                error: 'An error occured'
              }
              response.status(200).json(status)
            } else {
              const sqlQuery = {
                text:
                  'INSERT INTO users ("userId", "firstName", "lastName", "email", "password", "gender", "jobRole", "department", "address", "accessLevel") VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                values: [
                  userId,
                  firstName,
                  lastName,
                  email,
                  hash,
                  gender,
                  jobRole,
                  department,
                  address,
                  accessLevel
                ]
              }
              await pool.query(sqlQuery, (error, result) => {
                if (error) {
                  status = {
                    status: 'error',
                    status: 'error',
                    error: 'An error occured'
                  }
                  response.status(200).json(status)
                } else {
                  status = {
                    status: 'success',
                    data: {
                      message: 'User account successfully created',
                      token: '',
                      userId
                    }
                  }
                  response.status(200).json(status)
                }
              })
            }
          })
        }
      })
    }
  })
})

module.exports = authRoutes
