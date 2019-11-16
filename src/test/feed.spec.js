const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');
const should = chai.should();
const server = require('../index');

chai.use(chaiHttp);

describe('Teamwork', () => {
    let token;
    const userCredentials = {
        email: 'obama@gmail.com',
        password: 'pass',
    };
    describe('GET /feed', () => {
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
        it('it should allow user to view all articles or gifs', (done) => {
            chai
                .request(server)
                .get('/api/v1/feed/')
                .set('Content-Type', 'multipart/form-data')
                .set('token', token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('status').eql('success');
                    res.body.should.have.property('data').to.be.an('array');
                })
                .catch((err) => {
                    console.log(err.message);
                });
            done();

        });
    });

});
