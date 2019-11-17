const express = require('express');
const router = express.Router();
const { createGif, deleteGif, commentOnGif,
    getGif, flagGif, flagComment } = require('../controllers/GifsController')

router.post('/', createGif);
router.delete('/:gifId', deleteGif);
router.post('/:gifId/comment', commentOnGif)
router.get('/:gifId', getGif);
router.patch('/:gifId/flag', flagGif)
router.patch('/comments/:commentId/flag', flagComment)


module.exports = router;
