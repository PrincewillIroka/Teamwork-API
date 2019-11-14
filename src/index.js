const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const fileupload = require('express-fileupload');

const app = express();
const authRoute = require('./routes/auth.route');
const gifsRoute = require('./routes/gifs.route');


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

const server = app.listen(process.env.APP_PORT || 3002, () => {
  console.log(`Server listening on ${process.env.APP_PORT}`);
});

module.exports = server;
