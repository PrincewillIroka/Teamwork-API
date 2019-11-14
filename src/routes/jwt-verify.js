const jwt = require('jsonwebtoken');

const jwtVerification = (token) => {
  let hasError = false;
  let email = '', accessLevel = '', userId = '', payload = '';
  try {
    payload = jwt.verify(token, process.env.JWT_KEY);
    email = payload.email;
    accessLevel = payload.accessLevel;
    userId = payload.userId
  } catch (e) {
    hasError = true;
  }
  return { hasError, email, accessLevel, userId };
};

module.exports = jwtVerification;
