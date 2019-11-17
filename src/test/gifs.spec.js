const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');
const should = chai.should();
const server = require('../index');

chai.use(chaiHttp);

describe('Teamwork', () => {
    let token, gifId, commentId;
    const userCredentials = {
        email: 'robert@gmail.com',
        password: 'pass',
    };
    describe('POST /gifs', () => {
        before((done) => {
            chai
                .request(server)
                .post('/api/v1/auth/signin')
                .send(userCredentials)
                .end((error, response) => {
                    const { data } = response.body;
                    token = data.token;
                    done();
                });
        });
        it('it should allow user to create a gif', (done) => {
            chai
                .request(server)
                .post('/api/v1/gifs/')
                .set('Content-Type', 'multipart/form-data')
                .set('token', token)
                .field('title', 'My New Gif')
                .attach('gif', fs.readFileSync('./src/test/gif.gif'), 'gif.gif')
                .then((res) => {
                    const { data } = res.body;
                    gifId = data.gifId
                    res.should.have.status(201);
                    res.body.should.have.property('status').eql('success');
                    done();
                })
                .catch((err) => {
                    console.log(err.message);
                });

        });
    });

    describe('POST /gifs/:gifId/comment', () => {
        it('it should allow user to add comment to a gif', (done) => {
            chai
                .request(server)
                .post(`/api/v1/gifs/${gifId}/comment`)
                .set('Content-Type', 'multipart/form-data')
                .set('token', token)
                .field('comment', 'A new comment on a gif')
                .then((res) => {
                    const { data } = res.body;
                    commentId = data.commentId
                    res.should.have.status(201);
                    res.body.should.have.property('status').eql('success');
                    done();
                })
                .catch((err) => {
                    console.log(err.message);
                });

        });
    });

    describe('GET /gifs/:gifId', () => {
        it('it should allow user to view a specific gif', (done) => {
            chai
                .request(server)
                .get(`/api/v1/gifs/${gifId}`)
                .set('Content-Type', 'multipart/form-data')
                .set('token', token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('status').eql('success');
                    res.body.should.have.property('data').to.be.an('object')
                    done();
                })
                .catch((err) => {
                    console.log(err.message);
                });

        });
    });

    describe('PATCH /gifs/:gifId/flag', () => {
        it('it should allow user to flag an gif as inappropriate', (done) => {
            chai
                .request(server)
                .patch(`/api/v1/gifs/${gifId}/flag`)
                .set('Content-Type', 'multipart/form-data')
                .set('token', token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('status').eql('success');
                })
                .catch((err) => {
                    console.log(err.message);
                });
            done();

        });
    });

    describe('PATCH /gifs/comments/:commentId/flag', () => {
        it('it should allow user to flag a comment as inappropriate', (done) => {
            chai
                .request(server)
                .patch(`/api/v1/gifs/comments/${commentId}/flag`)
                .set('Content-Type', 'multipart/form-data')
                .set('token', token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('status').eql('success');
                })
                .catch((err) => {
                    console.log(err.message);
                });
            done();

        });
    });

    describe('DELETE /gifs/:gifId', () => {
        it('it should allow user to delete a gif', (done) => {
            chai
                .request(server)
                .delete(`/api/v1/gifs/${gifId}`)
                .set('Content-Type', 'multipart/form-data')
                .set('token', token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('status').eql('success');
                    done();
                })
                .catch((err) => {
                    console.log(err.message);
                });

        });
    });

    describe('DELETE /gifs/:gifId/inappropriate', () => {

        before((done) => {
            chai
                .request(server)
                .post('/api/v1/gifs/')
                .set('Content-Type', 'multipart/form-data')
                .set('token', token)
                .field('title', 'My New Gif')
                .attach('gif', fs.readFileSync('./src/test/gif.gif'), 'gif.gif')
                .end((error, res) => {
                    const { data } = res.body;
                    gifId = data.gifId
                    chai
                        .request(server)
                        .patch(`/api/v1/gifs/${gifId}/flag`)
                        .set('Content-Type', 'multipart/form-data')
                        .set('token', token)
                        .end((error, res) => {
                            done()
                        })

                })
        })

        it('it should allow admin to delete a gif flagged as inappropriate', (done) => {
            chai
                .request(server)
                .delete(`/api/v1/gifs/${gifId}/inappropriate`)
                .set('Content-Type', 'multipart/form-data')
                .set('token', token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('status').eql('success');
                    done();
                })
                .catch((err) => {
                    console.log(err.message);
                });

        });
    });

    describe('DELETE /gifs/comments/:commentId/inappropriate', () => {

        before((done) => {
            chai
                .request(server)
                .post('/api/v1/gifs/')
                .set('Content-Type', 'multipart/form-data')
                .set('token', token)
                .field('title', 'My New Gif')
                .attach('gif', fs.readFileSync('./src/test/gif.gif'), 'gif.gif')
                .end((error, res) => {
                    const { data } = res.body;
                    gifId = data.gifId

                    chai
                        .request(server)
                        .post(`/api/v1/gifs/${gifId}/comment`)
                        .set('Content-Type', 'multipart/form-data')
                        .set('token', token)
                        .field('comment', 'A new comment on a post')
                        .end((error, res) => {
                            const { data } = res.body;
                            commentId = data.commentId

                            chai
                                .request(server)
                                .patch(`/api/v1/gifs/comments/${commentId}/flag`)
                                .set('Content-Type', 'multipart/form-data')
                                .set('token', token)
                                .end((error, res) => {
                                    done()
                                })

                        })

                })
        })

        it('it should allow admin to delete a comment flagged as inappropriate', (done) => {
            chai
                .request(server)
                .delete(`/api/v1/gifs/comments/${commentId}/inappropriate`)
                .set('Content-Type', 'multipart/form-data')
                .set('token', token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('status').eql('success');
                    done();
                })
                .catch((err) => {
                    console.log(err.message);
                });

        });
    });

});
