const { pool } = require("../config");
const jwtVerification = require("../middleware/jwt-verify");

const getFeed = async (request, response) => {
    let status = {}, data = [],
        token = request.headers.token;

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
                'SELECT * FROM articles ORDER BY "createdOn"',
        };
        const sqlQuery2 = {
            text:
                'SELECT * FROM gifs ORDER BY "createdOn"',
        };


        await pool.query(sqlQuery1, async (error, result1) => {
            if (error) {
                status = {
                    status: "error",
                    error: "Internal server error"
                };
                response.status(500).json(status);
            } else {

                await pool.query(sqlQuery2, (error, result2) => {
                    if (error) {
                        status = {
                            status: "error",
                            error: "Internal server error"
                        };
                        response.status(500).json(status);
                    } else {

                        let articlesArr = result1.rows
                        let gifsArr = result2.rows

                        if (articlesArr.length > 0) {
                            articlesArr.map(el => {
                                let obj = {}
                                obj.id = el.articleId
                                obj.createdOn = el.createdOn
                                obj.title = el.title
                                obj.article = el.article
                                obj.authorId = el.userId
                                data.push(obj)
                            })
                        }

                        if (gifsArr.length > 0) {
                            gifsArr.map(el => {
                                let obj = {}
                                obj.id = el.gifId
                                obj.createdOn = el.createdOn
                                obj.title = el.title
                                obj.url = el.imageUrl
                                obj.authorId = el.userId
                                data.push(obj)
                            })

                        }

                        let array = []
                        if (data.length > 0) {
                            array = data.sort((a, b) => b.createdOn - a.createdOn);
                        }

                        status = {
                            status: "success",
                            data: array
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
        console.log(errorMessage)
        return response.status(400).json(status);
    }

}


module.exports = { getFeed }