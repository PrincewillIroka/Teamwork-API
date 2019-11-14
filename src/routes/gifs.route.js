const express = require('express');
const router = express.Router();
const { createGif } = require('../controllers/GifsController')

router.post('/', createGif);


module.exports = router;
