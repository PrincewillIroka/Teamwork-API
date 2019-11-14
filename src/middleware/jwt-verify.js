const jwt = require('jsonwebtoken');

const jwtVerification = (token) => {
  let isValid = '';
  let email = '', accessLevel = '', userId = '', payload = '';
  try {
    payload = jwt.verify(token, process.env.JWT_KEY);
    email = payload.email;
    accessLevel = payload.accessLevel;
    userId = payload.userId
    isValid = true;
  } catch (e) {
    isValid = false;
  }
  return { isValid, email, accessLevel, userId };
};

module.exports = jwtVerification;
