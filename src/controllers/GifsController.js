const { pool } = require("../config");
const cloudinary = require('cloudinary').v2;
const jwtVerification = require("../middleware/jwt-verify");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const createGif = async (request, response) => {
    let status = {},
        { title } = request.body;
    const file = request.files.gif;
    const token = request.headers.token;

    if (title && token && file) {
        const { isValid, userId } = jwtVerification(token)
        if (!isValid) {
            status = {
                status: "error",
                error: "Invalid token"
            };
            response.status(400).json(status);
            return;
        }

        if (file.mimetype !== 'image/gif') {
            status = {
                status: "error",
                error: "Please upload a GIF file"
            };
            response.status(201).json(status);
            return;
        }

        const cloudGifUrl = await cloudinary.uploader.upload(file.tempFilePath, (error, result) => {
            if (error) {
                status = {
                    status: "error",
                    error: "Please upload a GIF file"
                };
                response.status(400).json(status);
                return;
            }
            return result;
        });

        const imageUrl = cloudGifUrl.secure_url;
        const public_id = cloudGifUrl.public_id;

        const sqlQuery = {
            text:
                'INSERT INTO gifs ("title", "imageUrl", "public_id", "userId") VALUES($1, $2, $3, $4) RETURNING *',
            values: [title, imageUrl, public_id, userId]
        };
        await pool.query(sqlQuery, (error, result) => {
            if (error) {
                status = {
                    status: "error",
                    error: "An error occured"
                };
                response.status(500).json(status);
            } else {
                const { gifId, created_at } = result.rows[0]
                status = {
                    status: "success",
                    data: {
                        gifId,
                        message: "GIF image successfully posted",
                        createdOn: created_at,
                        userId,
                        title,
                        imageUrl
                    }
                };
                response.status(200).json(status);
            }
        });

    } else {
        let errorMessage = '';
        if (!title) {
            errorMessage = 'Invalid title';
        } else if (!token) {
            errorMessage = 'Invalid token';
        } else if (!file) {
            errorMessage = 'Invalid file';
        }
        status = {
            status: 'error',
            error: errorMessage,
        };
        return response.status(400).json(status);
    }


};

module.exports = { createGif };
