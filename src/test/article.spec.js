const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const server = require('../index');

chai.use(chaiHttp);

describe('Teamwork', () => {
    describe('POST /articles', () => {
        let token = '', articleId;
        const userCredentials = {
            email: 'obama@gmail.com',
            password: 'pass',
        };
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
                    res.should.have.status(200);
                    res.body.should.have.property('status').eql('success');
                })
                .catch((err) => {
                    console.log(err.message);
                });
            done();


        });
    });

});