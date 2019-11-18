const express = require('express');
const router = express.Router();
const { createArticle, editArticle, deleteArticle,
    commentOnArticle, getArticle, flagArticle, flagComment,
    deleteInappropriateArticle, deleteInappropriateComment,
    createCategory, getArticlesByCategory
} = require('../controllers/ArticleController')

router.post('/', createArticle);
router.patch('/:articleId', editArticle)
router.delete('/:articleId', deleteArticle)
router.post('/:articleId/comment', commentOnArticle)
router.get('/:articleId', getArticle)
router.patch('/:articleId/flag', flagArticle)
router.patch('/comments/:commentId/flag', flagComment)
router.delete('/:articleId/inappropriate', deleteInappropriateArticle)
router.delete('/comments/:commentId/inappropriate', deleteInappropriateComment)
router.post('/category', createCategory);
router.get('/categories/:categoryId', getArticlesByCategory)

module.exports = router;
