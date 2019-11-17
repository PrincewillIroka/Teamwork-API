const express = require('express');
const router = express.Router();
const { createGif, deleteGif, commentOnGif,
    getGif, flagGif, flagComment,
    deleteInappropriateGif, deleteInappropriateComment
} = require('../controllers/GifsController')

router.post('/', createGif);
router.delete('/:gifId', deleteGif);
router.post('/:gifId/comment', commentOnGif)
router.get('/:gifId', getGif);
router.patch('/:gifId/flag', flagGif)
router.patch('/comments/:commentId/flag', flagComment)
router.delete('/:gifId/inappropriate', deleteInappropriateGif)
router.delete('/comments/:commentId/inappropriate', deleteInappropriateComment)


module.exports = router;
