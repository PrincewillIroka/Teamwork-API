const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const server = require('../index');

chai.use(chaiHttp);

describe('Teamwork', () => {
    let token, articleId, commentId;
    const userCredentials = {
        email: 'obama@gmail.com',
        password: 'pass',
    };
    describe('POST /articles', () => {
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
        it('it should allow user to create an article', (done) => {
            chai
                .request(server)
                .post('/api/v1/articles/')
                .set('Content-Type', 'multipart/form-data')
                .set('token', token)
                .field('title', 'Test title')
                .field('article', 'Lorem Ipsum Mi consectetuer magna Ullamcorper sit, elit, morbi placerat luctus maecenas pulvinar ultrices aliquet, nibh conubia duis hymenaeos facilisis aliquet pellentesque aliquam lectus nisl parturient. Lacus quam velit, ornare placerat curae;. Ut porta auctor, quam. Dolor aliquet primis mus duis interdum.')
                .then((res) => {
                    const { data } = res.body;
                    articleId = data.articleId
                    res.should.have.status(201);
                    res.body.should.have.property('status').eql('success');
                    done();
                })
                .catch((err) => {
                    console.log(err.message);
                });


        });
    });

    describe('PATCH /articles/:articleId', () => {
        it('it should allow user to edit an article', (done) => {
            chai
                .request(server)
                .patch(`/api/v1/articles/${articleId}`)
                .set('Content-Type', 'multipart/form-data')
                .set('token', token)
                .field('title', 'Updated title')
                .field('article', 'This article has been updated, right now.')
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

    describe('POST /articles/:articleId/comment', () => {
        it('it should allow user to add comment to an article', (done) => {
            chai
                .request(server)
                .post(`/api/v1/articles/${articleId}/comment`)
                .set('Content-Type', 'multipart/form-data')
                .set('token', token)
                .field('comment', 'A new comment on a post')
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

    describe('GET /articles/:articleId', () => {
        it('it should allow user to view a specific article', (done) => {
            chai
                .request(server)
                .get(`/api/v1/articles/${articleId}`)
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

    describe('PATCH /articles/:articleId/flag', () => {
        it('it should allow user to flag an article as inappropriate', (done) => {
            chai
                .request(server)
                .patch(`/api/v1/articles/${articleId}/flag`)
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

    describe('PATCH /articles/comments/:commentId/flag', () => {
        it('it should allow user to flag an comment as inappropriate', (done) => {
            chai
                .request(server)
                .patch(`/api/v1/articles/comments/${commentId}/flag`)
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

    describe('DELETE /articles/:articleId', () => {
        it('it should allow user to delete an article', (done) => {
            chai
                .request(server)
                .delete(`/api/v1/articles/${articleId}`)
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