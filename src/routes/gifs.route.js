const express = require('express');
const router = express.Router();
const { createGif, deleteGif } = require('../controllers/GifsController')

router.post('/', createGif);
router.delete('/:gifId', deleteGif);


module.exports = router;
