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
                const { gifId, createdOn } = result.rows[0]
                status = {
                    status: "success",
                    data: {
                        gifId,
                        message: "GIF image successfully posted",
                        createdOn,
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

    if (token && gifId && !isNaN(gifId)) {
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
        } else if (!gifId || isNaN(gifId)) {
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
    if (token && gifId && !isNaN(gifId) && comment) {
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
                        const { commentId, createdOn } = result2.rows[0]
                        status = {
                            status: "success",
                            data: {
                                message: "Comment successfully created",
                                createdOn,
                                gifTitle: title,
                                comment,
                                commentId
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
        } else if (!gifId && isNaN(gifId)) {
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

const getGif = async (request, response) => {
    let status = {},
        { gifId } = request.params, token = request.headers.token;

    if (token && gifId && !isNaN(gifId)) {
        const { isValid } = jwtVerification(token)
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
            }
            else {
                const sqlQuery2 = {
                    text:
                        'SELECT * FROM "gifComments" WHERE "gifId" = $1',
                    values: [gifId]
                };
                await pool.query(sqlQuery2, async (error, result2) => {
                    if (error) {
                        status = {
                            status: "error",
                            error: "Internal server error"
                        };
                        response.status(500).json(status);
                    } else {
                        const gif = result.rows[0]
                        const comments = result2.rows
                        comments.map(comment => {
                            comment.authorId = comment.userId
                            delete comment.gifId
                            delete comment.userId
                            return comment
                        })
                        status = {
                            status: "success",
                            data: {
                                id: gifId,
                                createdOn: gif.createdOn,
                                title: gif.title,
                                gif: gif.gif,
                                comments
                            }
                        };
                        response.status(200).json(status);
                    }

                })


            }
        });

    } else {
        let errorMessage = '';
        if (!token) {
            errorMessage = 'Invalid token';
        } else if (!gifId || isNaN(gifId)) {
            errorMessage = 'Invalid gifId'
        }
        status = {
            status: 'error',
            error: errorMessage,
        };
        return response.status(400).json(status);
    }
}

const flagGif = async (request, response) => {
    let status = {},
        { gifId } = request.params,
        token = request.headers.token;

    if (token && gifId && !isNaN(gifId)) {
        const { isValid } = jwtVerification(token)
        if (!isValid) {
            status = {
                status: "error",
                error: "Invalid token"
            };
            response.status(400).json(status);
            return;
        }

        const sqlQuery = {
            text:
                'UPDATE gifs SET "flag" = $1 WHERE "gifId" = $2 RETURNING *',
            values: [true, gifId]
        };
        await pool.query(sqlQuery, (error, result) => {
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
            }
            else {
                const { title, flag } = result.rows[0]
                status = {
                    status: "success",
                    data: {
                        message: "Gif flagged as inappropriate",
                        title,
                        flag
                    }
                };
                response.status(200).json(status);
            }
        });

    } else {
        let errorMessage = '';
        if (!token) {
            errorMessage = 'Invalid token';
        } else if (!gifId || isNaN(gifId)) {
            errorMessage = 'Invalid gifId'
        }
        status = {
            status: 'error',
            error: errorMessage,
        };
        return response.status(400).json(status);
    }
}

const flagComment = async (request, response) => {
    let status = {},
        { commentId } = request.params,
        token = request.headers.token;

    if (token && commentId && !isNaN(commentId)) {
        const { isValid } = jwtVerification(token)
        if (!isValid) {
            status = {
                status: "error",
                error: "Invalid token"
            };
            response.status(400).json(status);
            return;
        }

        const sqlQuery = {
            text:
                'UPDATE "gifComments" SET "flag" = $1 WHERE "commentId" = $2 RETURNING *',
            values: [true, commentId]
        };
        await pool.query(sqlQuery, (error, result) => {

            if (error) {
                status = {
                    status: "error",
                    error: "Internal server error"
                };
                response.status(500).json(status);
            } else if (result.rows.length === 0) {
                status = {
                    status: "error",
                    error: "Comment doesn't exist"
                };
                response.status(400).json(status);
            }
            else {
                const { comment, flag } = result.rows[0]
                status = {
                    status: "success",
                    data: {
                        message: "Comment flagged as inappropriate",
                        comment,
                        flag
                    }
                };
                response.status(200).json(status);
            }
        });

    } else {
        let errorMessage = '';
        if (!token) {
            errorMessage = 'Invalid token';
        } else if (!commentId || isNaN(commentId)) {
            errorMessage = 'Invalid commentId'
        }
        status = {
            status: 'error',
            error: errorMessage,
        };
        return response.status(400).json(status);
    }
}

const deleteInappropriateGif = async (request, response) => {
    let status = {},
        { gifId } = request.params
    const token = request.headers.token;
    if (token && gifId && !isNaN(gifId)) {
        const { isValid, accessLevel } = jwtVerification(token)
        if (!isValid) {
            status = {
                status: "error",
                error: "Invalid token"
            };
            response.status(400).json(status);
            return;
        } else if (accessLevel !== 'admin') {
            status = {
                status: 'error',
                error: 'Sorry! only admins can access this',
            };
            response.status(401).json(status);
        } else {
            const sqlQuery1 = {
                text:
                    'SELECT * FROM gifs WHERE "gifId" = $1 AND flag = $2',
                values: [gifId, true]
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
                        error: "Couldn't find inappropriate gif"
                    };
                    response.status(400).json(status);
                } else {

                    const sqlQuery2 = {
                        text:
                            'DELETE FROM "gifComments" WHERE "gifId" = $1 ',
                        values: [gifId]
                    };

                    await pool.query(sqlQuery2, async (error, result) => {
                        if (error) {
                            status = {
                                status: "error",
                                error: "Internal server error"
                            };
                            response.status(500).json(status);
                        } else {
                            const sqlQuery3 = {
                                text:
                                    'DELETE FROM gifs WHERE "gifId" = $1',
                                values: [gifId]
                            };
                            await pool.query(sqlQuery3, async (error, result2) => {
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

            })
        }

    } else {
        let errorMessage = '';
        if (!token) {
            errorMessage = 'Invalid token';
        } else if (!gifId || isNaN(gifId)) {
            errorMessage = 'Invalid gifId';
        }
        status = {
            status: 'error',
            error: errorMessage,
        };
        return response.status(400).json(status);
    }
}

const deleteInappropriateComment = async (request, response) => {
    let status = {},
        { commentId } = request.params
    const token = request.headers.token;
    if (token && commentId && !isNaN(commentId)) {
        const { isValid, accessLevel } = jwtVerification(token)
        if (!isValid) {
            status = {
                status: "error",
                error: "Invalid token"
            };
            response.status(400).json(status);
            return;
        } else if (accessLevel !== 'admin') {
            status = {
                status: 'error',
                error: 'Sorry! only admins can access this',
            };
            response.status(401).json(status);
        } else {

            const sqlQuery1 = {
                text:
                    'SELECT * FROM "gifComments" WHERE "commentId" = $1 AND flag = $2',
                values: [commentId, true]
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
                        error: "Couldn't find inappropriate comment"
                    };
                    response.status(400).json(status);
                } else {

                    const sqlQuery2 = {
                        text:
                            'DELETE FROM "gifComments" WHERE "commentId" = $1 ',
                        values: [commentId]
                    };

                    await pool.query(sqlQuery2, async (error, result) => {
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
                                    message: "Comment successfully deleted"
                                }
                            };
                            response.status(200).json(status);
                        }
                    });
                }
            })
        }

    } else {
        let errorMessage = '';
        if (!token) {
            errorMessage = 'Invalid token';
        } else if (!commentId || isNaN(commentId)) {
            errorMessage = 'Invalid commentId';
        }
        status = {
            status: 'error',
            error: errorMessage,
        };
        return response.status(400).json(status);
    }
}

module.exports = {
    createGif, deleteGif, commentOnGif,
    getGif, flagGif, flagComment, deleteInappropriateGif,
    deleteInappropriateComment
};
