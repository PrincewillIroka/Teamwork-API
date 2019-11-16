const express = require('express');
const router = express.Router();
const { createGif, deleteGif, commentOnGif } = require('../controllers/GifsController')

router.post('/', createGif);
router.delete('/:gifId', deleteGif);
router.post('/:gifId/comment', commentOnGif)


module.exports = router;
