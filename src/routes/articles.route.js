const express = require('express');
const router = express.Router();
const { createArticle, editArticle, deleteArticle,
    commentOnArticle, getArticle } = require('../controllers/ArticleController')

router.post('/', createArticle);
router.patch('/:articleId', editArticle)
router.delete('/:articleId', deleteArticle)
router.post('/:articleId/comment', commentOnArticle)
router.get('/:articleId', getArticle)

module.exports = router;
