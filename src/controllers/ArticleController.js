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
                    error: "An error occured"
                };
                response.status(500).json(status);
            } else {
                const { articleId, created_at } = result.rows[0]
                status = {
                    status: "success",
                    data: {
                        message: "Article successfully posted",
                        articleId,
                        createdOn: created_at,
                        title
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

module.exports = { createArticle }