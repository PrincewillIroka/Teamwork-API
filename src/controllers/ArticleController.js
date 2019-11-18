const { pool } = require("../config");
const jwtVerification = require("../middleware/jwt-verify");

const createArticle = async (request, response) => {
    let status = {},
        { title, article, categoryId } = request.body;
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

        let catId = 0
        if (categoryId && isNaN(categoryId)) {
            status = {
                status: "error",
                error: "Invalid categoryId"
            };
            response.status(400).json(status);
            return;
        } else if (categoryId) {
            catId = categoryId
        }


        const sqlQuery = {
            text:
                'INSERT INTO articles ("title", "article", "userId", "categoryId") VALUES($1, $2, $3, $4) RETURNING *',
            values: [title, article, userId, catId]
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

    if (title && token && article && articleId && !isNaN(articleId)) {
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
                    await pool.query(sqlQuery2, (error, result2) => {
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
        } else if (!articleId || isNaN(articleId)) {
            errorMessage = 'Invalid articleId';
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

    if (token && articleId && !isNaN(articleId)) {
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
        } else if (!articleId || isNaN(articleId)) {
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
    if (token && articleId && !isNaN(articleId) && comment) {
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
                        const { commentId, createdOn } = result2.rows[0]
                        status = {
                            status: "success",
                            data: {
                                message: "Comment successfully created",
                                createdOn,
                                articleTitle: title,
                                article,
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
        } else if (!articleId || isNaN(articleId)) {
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

const getArticle = async (request, response) => {
    let status = {},
        { articleId } = request.params, token = request.headers.token;

    if (token) {
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
                const sqlQuery2 = {
                    text:
                        'SELECT * FROM "articleComments" WHERE "articleId" = $1',
                    values: [articleId]
                };
                await pool.query(sqlQuery2, async (error, result2) => {
                    if (error) {
                        status = {
                            status: "error",
                            error: "Internal server error"
                        };
                        response.status(500).json(status);
                    } else {
                        const article = result.rows[0]
                        const comments = result2.rows
                        comments.map(comment => {
                            comment.authorId = comment.userId
                            delete comment.articleId
                            delete comment.userId
                            return comment
                        })
                        status = {
                            status: "success",
                            data: {
                                id: articleId,
                                createdOn: article.createdOn,
                                title: article.title,
                                article: article.article,
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
        }
        status = {
            status: 'error',
            error: errorMessage,
        };
        return response.status(400).json(status);
    }
}

const flagArticle = async (request, response) => {
    let status = {},
        { articleId } = request.params,
        token = request.headers.token;

    if (token && articleId && !isNaN(articleId)) {
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
                'UPDATE articles SET "flag" = $1 WHERE "articleId" = $2 RETURNING *',
            values: [true, articleId]
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
                    error: "Article doesn't exist"
                };
                response.status(400).json(status);
            }
            else {
                const { title, article, flag } = result.rows[0]
                status = {
                    status: "success",
                    data: {
                        message: "Article flagged as in appropriate",
                        title,
                        article,
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
        } else if (!articleId || isNaN(articleId)) {
            errorMessage = 'Invalid articleId';
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
                'UPDATE "articleComments" SET "flag" = $1 WHERE "commentId" = $2 RETURNING *',
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
                    error: "Article doesn't exist"
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
            errorMessage = 'Invalid commentId';
        }
        status = {
            status: 'error',
            error: errorMessage,
        };
        return response.status(400).json(status);
    }
}

const deleteInappropriateArticle = async (request, response) => {
    let status = {},
        { articleId } = request.params
    const token = request.headers.token;
    if (token && articleId && !isNaN(articleId)) {
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
                    'SELECT * FROM articles WHERE "articleId" = $1 AND flag = $2',
                values: [articleId, true]
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
                        error: "Couldn't find inappropriate article"
                    };
                    response.status(400).json(status);
                } else {

                    const sqlQuery2 = {
                        text:
                            'DELETE FROM "articleComments" WHERE "articleId" = $1 ',
                        values: [articleId]
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
                                    'DELETE FROM articles WHERE "articleId" = $1',
                                values: [articleId]
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
                                            message: "Article successfully deleted"
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
        } else if (!articleId || isNaN(articleId)) {
            errorMessage = 'Invalid articleId';
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
                    'SELECT * FROM "articleComments" WHERE "commentId" = $1 AND flag = $2',
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
                            'DELETE FROM "articleComments" WHERE "commentId" = $1 ',
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

const createCategory = async (request, response) => {
    let status = {},
        { category } = request.body
    const token = request.headers.token;
    if (token && category) {
        let { isValid, accessLevel } = jwtVerification(token)
        if (!isValid) {
            status = {
                status: 'error',
                error: 'Invalid token',
            };
            response.status(400).json(status);
        } else if (accessLevel !== 'admin') {
            status = {
                status: 'error',
                error: 'Sorry! only admins can access this',
            };
            response.status(401).json(status);
        } else {
            const sqlQuery = {
                text:
                    'INSERT INTO categories ("category") VALUES($1) RETURNING *',
                values: [category]
            };
            await pool.query(sqlQuery, (error, result) => {
                if (error) {
                    status = {
                        status: "error",
                        error: "Internal server error"
                    };
                    response.status(500).json(status);
                } else {
                    const { categoryId } = result.rows[0]
                    status = {
                        status: "success",
                        data: {
                            message: "Category successfully added",
                            categoryId
                        }
                    };
                    response.status(201).json(status);
                }
            });
        }
    } else {
        let errorMessage = '';
        if (!token) {
            errorMessage = 'Invalid token';
        } else if (!category) {
            errorMessage = 'Invalid category';
        }
        status = {
            status: 'error',
            error: errorMessage,
        };
        return response.status(400).json(status);
    }
}

const getArticlesByCategory = async (request, response) => {
    let status = {},
        { categoryId } = request.params, token = request.headers.token;

    if (token && categoryId && !isNaN(categoryId)) {
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
                'SELECT * FROM articles WHERE "categoryId" = $1',
            values: [categoryId]
        };

        await pool.query(sqlQuery, async (error, result) => {
            if (error) {
                status = {
                    status: "error",
                    error: "Internal server error"
                };
                response.status(500).json(status);
            } else {
                const articles = result.rows
                if (articles.length > 0) {
                    articles.map(article => {
                        article.id = article.articleId
                        delete article.id
                        return article
                    })
                }

                status = {
                    status: "success",
                    data: articles
                };
                response.status(200).json(status);
            }
        });

    } else {
        let errorMessage = '';
        if (!token) {
            errorMessage = 'Invalid token';
        } else if (!categoryId || isNaN(categoryId)) {
            errorMessage = 'Invalid categoryId';
        }
        status = {
            status: 'error',
            error: errorMessage,
        };
        return response.status(400).json(status);
    }

}

module.exports = {
    createArticle, editArticle, deleteArticle,
    commentOnArticle, getArticle, flagArticle,
    flagComment, deleteInappropriateArticle, deleteInappropriateComment,
    createCategory, getArticlesByCategory
}