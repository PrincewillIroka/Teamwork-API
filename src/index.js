const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const fileupload = require('express-fileupload');

const app = express();
const authRoute = require('./routes/auth.route');
const gifsRoute = require('./routes/gifs.route');
const articlesRoute = require('./routes/articles.route');
const feedRoute = require('./routes/feed.route');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use(hpp());
app.use(fileupload({
  useTempFiles: true,
}));

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/gifs', gifsRoute);
app.use('/api/v1/articles', articlesRoute);
app.use('/api/v1/feed', feedRoute);

app.get('/', function (req, res) {
  res.status(200).json({ message: 'Welcome to Teamwork API' });
});

app.use(function (req, res) {
  res.status(404).json({ message: 'Sorry, page not found' });
});

const port = process.env.APP_PORT || process.env.PORT || 3002
const server = app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

module.exports = server;
