const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');
const should = chai.should();
const server = require('../index');

chai.use(chaiHttp);

describe('Teamwork', () => {
    let token = '';
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
                    res.should.have.status(201);
                    res.body.should.have.property('status').eql('success');
                    done();
                })
                .catch((err) => {
                    console.log(err.message);
                });

        });
    });

});
