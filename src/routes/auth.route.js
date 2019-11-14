const express = require('express');
const router = express.Router();
const { createUser, signIn, clearDb } = require('../controllers/AuthController')

router.post('/create-user', createUser);
router.post('/signin', signIn);
router.post('/clear-db', clearDb);


module.exports = router;
