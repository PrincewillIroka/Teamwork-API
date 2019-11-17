const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');
const should = chai.should();
const server = require('../index');

chai.use(chaiHttp);

describe('Teamwork', () => {
    let token, gifId;
    const userCredentials = {
        email: 'obama@gmail.com',
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

});
