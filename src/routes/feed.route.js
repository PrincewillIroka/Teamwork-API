const express = require('express');
const router = express.Router();
const { getFeed } = require('../controllers/FeedController')

router.get('/', getFeed);

module.exports = router;
