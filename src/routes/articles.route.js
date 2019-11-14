const express = require('express');
const router = express.Router();
const { createArticle } = require('../controllers/ArticleController')

router.post('/', createArticle);


module.exports = router;
