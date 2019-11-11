const jwt = require('jsonwebtoken')
const jwtKey = 'securesecretkey'

const jwtVerification = token => {
  let hasError = false
  try {
    jwt.verify(token, jwtKey)
  } catch (e) {
    hasError = true
  }
  return hasError
}

module.exports = jwtVerification
