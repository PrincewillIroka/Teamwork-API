const express = require('express');
const router = express.Router();
const { createArticle, editArticle } = require('../controllers/ArticleController')

router.post('/', createArticle);
router.patch('/:articleId', editArticle)


module.exports = router;
