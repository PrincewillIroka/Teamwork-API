const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config');
const jwtVerification = require('../middleware/jwt-verify');

const SALT_WORK_FACTOR = 10;
const jwtExpirySeconds = 10800;

const isValidEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
};

const createUser = (request, response) => {
    let status = {};
    const {
        firstName,
        lastName,
        email,
        password,
        gender,
        jobRole,
        department,
        address,
        token,
    } = request.body;

    if (firstName && lastName && email && isValidEmail(email) && password
        && gender && jobRole && department && address && token) {
        if (!jwtVerification(token).isValid) {
            status = {
                status: 'error',
                error: 'Invalid token',
            };
            response.status(400).json(status);
        } else if (jwtVerification(token).accessLevel !== 'admin') {
            status = {
                status: 'error',
                error: 'Sorry! only admins can access this',
            };
            response.status(400).json(status);
        } else {
            const accessLevel = 'employee';
            const userId = Number(
                new Date()
                    .valueOf()
                    .toString()
                    .substring(0, 7),
            );

            const sqlQuery = {
                text: 'SELECT * FROM users WHERE email = $1',
                values: [email],
            };
            pool.query(sqlQuery, (error, result) => {
                if (error) {
                    status = {
                        status: 'error',
                        error: 'An error occured',
                    };
                    response.status(500).json(status);
                } else if (result.rows.length > 0) {
                    status = {
                        status: 'error',
                        error: 'User already exists',
                    };
                    response.status(201).json(status);
                } else {
                    bcrypt.genSalt(SALT_WORK_FACTOR, (error, salt) => {
                        if (error) {
                            status = {
                                status: 'error',
                                error: 'An error occured',
                            };
                            response.status(500).json(status);
                        } else {
                            // hash the password along with our new salt
                            bcrypt.hash(password, salt, async (error, hash) => {
                                if (error) {
                                    status = {
                                        status: 'error',
                                        error: 'An error occured',
                                    };
                                    response.status(500).json(status);
                                } else {
                                    const sqlQuery = {
                                        text:
                                            'INSERT INTO users ("userId", "firstName", "lastName", "email", "password", "gender", "jobRole", "department", "address", "accessLevel") VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                                        values: [
                                            userId,
                                            firstName,
                                            lastName,
                                            email,
                                            hash,
                                            gender,
                                            jobRole,
                                            department,
                                            address,
                                            accessLevel,
                                        ],
                                    };
                                    await pool.query(sqlQuery, (error, result) => {
                                        if (error) {
                                            status = {
                                                status: 'error',
                                                status: 'error',
                                                error: 'An error occured',
                                            };
                                            response.status(500).json(status);
                                        } else {
                                            status = {
                                                status: 'success',
                                                data: {
                                                    message: 'User account successfully created',
                                                    token,
                                                    userId,
                                                },
                                            };
                                            response.status(200).json(status);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    } else {
        const errorMessage = !firstName ? 'Invalid First Name' : !lastName ? 'Invalid Last Name'
            : (!email || !isValidEmail(email)) ? 'Invalid Email' : !password ? 'Invalid Password'
                : !gender ? 'Invalid Gender' : !jobRole ? 'Invalid Job Role' : !department ? 'Invalid Department'
                    : !address ? 'Invalid Address' : 'Invalid Token';
        status = {
            status: 'error',
            error: errorMessage,
        };
        response.status(400).json(status);
    }
};

const signIn = (request, response) => {
    let status = {};
    const { email, password } = request.body;

    if (email && password && isValidEmail(email)) {
        const sqlQuery = {
            text: 'SELECT * FROM users WHERE email = $1',
            values: [email],
        };

        pool.query(sqlQuery, (error, result) => {
            if (error) {
                status = {
                    status: 'error',
                    error: 'An error occured',
                };

                response.status(500).json(status);
            } else if (result.rows.length > 0) {
                bcrypt.compare(password, result.rows[0].password, (err, isMatch) => {
                    if (err) {
                        status = {
                            status: 'error',
                            error: 'An error occured',
                        };
                        response.status(500).json(status);
                    } else if (!isMatch) {
                        status = {
                            status: 'error',
                            error: 'Invalid Login',
                        };
                        response.status(201).json(status);
                    } else {
                        const { userId, accessLevel } = result.rows[0];
                        const token = jwt.sign({ email, accessLevel, userId }, process.env.JWT_KEY, {
                            algorithm: 'HS256',
                            expiresIn: jwtExpirySeconds,
                        });
                        status = {
                            status: 'success',
                            data: {
                                token,
                                userId,
                                accessLevel,
                            },
                        };
                        response.status(200).json(status);
                    }
                });
            } else {
                status = {
                    status: 'error',
                    error: "Sorry, user doesn't exist",
                };
                response.status(201).json(status);
            }
        });
    } else {
        let errorMessage = '';
        if (!email || !isValidEmail(email)) {
            errorMessage = 'Invalid email';
        } else if (!password) {
            errorMessage = 'Invalid password';
        }
        status = {
            status: 'error',
            error: errorMessage,
        };
        return response.status(400).json(status);
    }
};

const clearDb = (request, response) => {
    let status = {};
    const { token } = request.body;

    if (!jwtVerification(token).isValid) {
        status = {
            status: 'error',
            error: 'Unauthorized access',
        };
        response.status(400).json(status);
        return;
    }

    const sqlQuery = {
        text: 'DELETE FROM users WHERE email = $1',
        values: ['jobs@gmail.com'],
    };

    pool.query(sqlQuery, (error, result) => {
        if (error) {
            status = {
                status: 'error',
                error: 'An error occured',
            };
            response.status(500).json(status);
        } else {
            status = {
                status: 'success',
            };
            response.status(200).json(status);
        }
    });
};


module.exports = { createUser, signIn, clearDb };
