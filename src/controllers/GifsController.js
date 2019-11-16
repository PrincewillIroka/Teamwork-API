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
            response.status(400).json(status);
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
                    error: "Internal server error"
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
                response.status(201).json(status);
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

const deleteGif = async (request, response) => {
    let status = {},
        { gifId } = request.params
    const token = request.headers.token;

    if (token && gifId) {
        const { isValid, userId } = jwtVerification(token)
        let verifiedUserId = userId
        if (!isValid) {
            status = {
                status: "error",
                error: "Invalid token"
            };
            response.status(400).json(status);
            return;
        }

        const sqlQuery1 = {
            text:
                'SELECT * FROM gifs WHERE "gifId" = $1',
            values: [gifId]
        };

        await pool.query(sqlQuery1, async (error, result) => {
            if (error) {
                status = {
                    status: "error",
                    error: "Internal server error"
                };
                response.status(500).json(status);
            } else if (result.rows.length === 0) {
                status = {
                    status: "error",
                    error: "Gif doesn't exist"
                };
                response.status(400).json(status);
            } else {
                const { userId, imageUrl, public_id } = result.rows[0];
                if (verifiedUserId !== userId) {
                    status = {
                        status: "error",
                        error: "Unauthorized access"
                    };
                    response.status(401).json(status);
                } else {
                    await cloudinary.api.delete_resources([public_id],
                        async (error, result) => {
                            if (error) {
                                status = {
                                    status: "error",
                                    error: "Internal server error"
                                };
                                response.status(500).json(status);
                            } else {
                                const sqlQuery2 = {
                                    text:
                                        'DELETE FROM gifs WHERE "gifId" = $1 AND "userId" = $2',
                                    values: [gifId, userId]
                                };
                                await pool.query(sqlQuery2, (error, result) => {
                                    if (error) {
                                        status = {
                                            status: "error",
                                            error: "Internal server error"
                                        };
                                        response.status(500).json(status);
                                    } else {
                                        status = {
                                            status: "success",
                                            data: {
                                                message: "Gif successfully deleted"
                                            }
                                        };
                                        response.status(200).json(status);
                                    }
                                });
                            }
                        });

                }
            }

        })

    } else {
        let errorMessage = '';
        if (!token) {
            errorMessage = 'Invalid token';
        } else if (!gifId) {
            errorMessage = 'Invalid gifId';
        }
        status = {
            status: 'error',
            error: errorMessage,
        };
        return response.status(400).json(status);
    }
}

const commentOnGif = async (request, response) => {
    let status = {},
        { comment } = request.body,
        { gifId } = request.params
    const token = request.headers.token;
    if (token && gifId && comment) {
        const { isValid, userId } = jwtVerification(token)
        if (!isValid) {
            status = {
                status: "error",
                error: "Invalid token"
            };
            response.status(400).json(status);
            return;
        }

        const sqlQuery1 = {
            text:
                'SELECT * FROM gifs WHERE "gifId" = $1',
            values: [gifId]
        };

        await pool.query(sqlQuery1, async (error, result1) => {

            if (error) {
                status = {
                    status: "error",
                    error: "Internal server error"
                };
                response.status(500).json(status);
            } else if (result1.rows.length === 0) {
                status = {
                    status: "error",
                    error: "Gif doesn't exist"
                };
                response.status(400).json(status);
            } else {
                const { title } = result1.rows[0]

                const sqlQuery2 = {
                    text:
                        'INSERT INTO "gifComments" ("comment", "userId", "gifId") VALUES($1, $2, $3) RETURNING *',
                    values: [comment, userId, gifId]
                };

                await pool.query(sqlQuery2, (error, result2) => {
                    if (error) {
                        status = {
                            status: "error",
                            error: "Internal server error"
                        };
                        response.status(500).json(status);
                    } else {
                        const { created_at } = result2.rows[0]
                        status = {
                            status: "success",
                            data: {
                                message: "Comment successfully created",
                                createdOn: created_at,
                                gifTitle: title,
                                comment
                            }
                        };
                        response.status(201).json(status);
                    }
                });

            }

        })

    } else {
        let errorMessage = '';
        if (!token) {
            errorMessage = 'Invalid token';
        } else if (!gifId) {
            errorMessage = 'Invalid gifId';
        } else if (!comment) {
            errorMessage = 'Invalid comment';
        }
        status = {
            status: 'error',
            error: errorMessage,
        };
        return response.status(400).json(status);
    }
}

module.exports = { createGif, deleteGif, commentOnGif };
