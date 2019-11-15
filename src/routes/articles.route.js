const express = require('express');
const router = express.Router();
const { createArticle, editArticle, deleteArticle } = require('../controllers/ArticleController')

router.post('/', createArticle);
router.patch('/:articleId', editArticle)
router.delete('/:articleId', deleteArticle)


module.exports = router;
