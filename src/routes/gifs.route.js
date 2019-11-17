const express = require('express');
const router = express.Router();
const { createGif, deleteGif, commentOnGif, getGif } = require('../controllers/GifsController')

router.post('/', createGif);
router.delete('/:gifId', deleteGif);
router.post('/:gifId/comment', commentOnGif)
router.get('/:gifId', getGif);


module.exports = router;
