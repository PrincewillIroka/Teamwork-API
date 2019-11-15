const express = require('express');
const router = express.Router();
const { createArticle, editArticle, deleteArticle, commentOnArticle } = require('../controllers/ArticleController')

router.post('/', createArticle);
router.patch('/:articleId', editArticle)
router.delete('/:articleId', deleteArticle)
router.post('/:articleId/comment', commentOnArticle)

module.exports = router;
