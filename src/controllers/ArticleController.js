const { pool } = require("../config");
const jwtVerification = require("../middleware/jwt-verify");

const createArticle = async (request, response) => {
    let status = {},
        { title, article } = request.body;
    const token = request.headers.token;

    if (title && token && article) {
        const { isValid, userId } = jwtVerification(token)
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
                'INSERT INTO articles ("title", "article", "userId") VALUES($1, $2, $3) RETURNING *',
            values: [title, article, userId]
        };
        await pool.query(sqlQuery, (error, result) => {
            if (error) {
                status = {
                    status: "error",
                    error: "Internal server error"
                };
                response.status(500).json(status);
            } else {
                const { articleId, createdOn } = result.rows[0]
                status = {
                    status: "success",
                    data: {
                        message: "Article successfully posted",
                        articleId,
                        createdOn,
                        title
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
        } else if (!article) {
            errorMessage = 'Invalid article';
        }
        status = {
            status: 'error',
            error: errorMessage,
        };
        return response.status(400).json(status);
    }

}

const editArticle = async (request, response) => {
    let status = {},
        { articleId } = request.params,
        { title, article } = request.body;
    const token = request.headers.token;

    if (title && token && article) {
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
                'SELECT * FROM articles WHERE "articleId" = $1',
            values: [articleId]
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
                    error: "Article doesn't exist"
                };
                response.status(400).json(status);
            }
            else {
                const { userId } = result.rows[0]
                if (verifiedUserId !== userId) {
                    status = {
                        status: "error",
                        error: "Unauthorized access"
                    };
                    response.status(401).json(status);
                } else {
                    const sqlQuery2 = {
                        text:
                            'UPDATE articles SET "title" = $1, "article" = $2 WHERE "articleId" = $3 AND "userId" = $4 RETURNING *',
                        values: [title, article, articleId, userId]
                    };
                    await pool.query(sqlQuery2, (error, result) => {
                        if (error) {
                            status = {
                                status: "error",
                                error: "Internal server error"
                            };
                            response.status(500).json(status);
                        }
                        else {
                            status = {
                                status: "success",
                                data: {
                                    message: "Article successfully updated",
                                    title,
                                    article
                                }
                            };
                            response.status(200).json(status);
                        }
                    });
                }

            }
        });

    } else {
        let errorMessage = '';
        if (!title) {
            errorMessage = 'Invalid title';
        } else if (!token) {
            errorMessage = 'Invalid token';
        } else if (!article) {
            errorMessage = 'Invalid article';
        }
        status = {
            status: 'error',
            error: errorMessage,
        };
        return response.status(400).json(status);
    }
}

const deleteArticle = async (request, response) => {
    let status = {},
        { articleId } = request.params
    const token = request.headers.token;

    if (token && articleId) {
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
                'SELECT * FROM articles WHERE "articleId" = $1',
            values: [articleId]
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
                    error: "Article doesn't exist"
                };
                response.status(400).json(status);
            } else {
                const { userId } = result.rows[0]
                if (verifiedUserId !== userId) {
                    status = {
                        status: "error",
                        error: "Unauthorized access"
                    };
                    response.status(401).json(status);
                } else {
                    const sqlQuery2 = {
                        text:
                            'DELETE FROM articles WHERE "articleId" = $1 AND "userId" = $2',
                        values: [articleId, userId]
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
                                    message: "Article successfully deleted"
                                }
                            };
                            response.status(200).json(status);
                        }
                    });
                }
            }

        })

    } else {
        let errorMessage = '';
        if (!token) {
            errorMessage = 'Invalid token';
        } else if (!articleId) {
            errorMessage = 'Invalid articleId';
        }
        status = {
            status: 'error',
            error: errorMessage,
        };
        return response.status(400).json(status);
    }
}

const commentOnArticle = async (request, response) => {
    let status = {},
        { comment } = request.body,
        { articleId } = request.params
    const token = request.headers.token;
    if (token && articleId && comment) {
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
                'SELECT * FROM articles WHERE "articleId" = $1',
            values: [articleId]
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
                    error: "Article doesn't exist"
                };
                response.status(400).json(status);
            } else {
                const { title, article } = result1.rows[0]

                const sqlQuery2 = {
                    text:
                        'INSERT INTO "articleComments" ("comment", "userId", "articleId") VALUES($1, $2, $3) RETURNING *',
                    values: [comment, userId, articleId]
                };

                await pool.query(sqlQuery2, (error, result2) => {

                    if (error) {
                        status = {
                            status: "error",
                            error: "Internal server error"
                        };
                        response.status(500).json(status);
                    } else {
                        const { createdOn } = result2.rows[0]
                        status = {
                            status: "success",
                            data: {
                                message: "Comment successfully created",
                                createdOn,
                                articleTitle: title,
                                article,
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
        } else if (!articleId) {
            errorMessage = 'Invalid articleId';
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

module.exports = { createArticle, editArticle, deleteArticle, commentOnArticle }