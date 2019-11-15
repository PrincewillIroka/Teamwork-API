const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const server = require('../index');

chai.use(chaiHttp);

describe('Teamwork', () => {
  describe('POST /create-user', () => {
    let adminToken = '';
    const adminCredentials = {
      email: 'robert@gmail.com',
      password: 'pass',
    };
    before((done) => {
      chai
        .request(server)
        .post('/api/v1/auth/signin')
        .send(adminCredentials)
        .end((error, response) => {
          const { data } = response.body;
          adminToken = data.token;
          done();
        });
    });
    after((done) => {
      chai
        .request(server)
        .post('/api/v1/auth/clear-db')
        .send({ token: adminToken })
        .end((error, response) => {
          done();
        });
    });
    it('it should create an employee user account', (done) => {
      const data = {
        firstName: 'Steve',
        lastName: 'Jobs',
        email: 'jobs@gmail.com',
        password: 'pass',
        gender: 'Male',
        jobRole: 'Software Developer',
        department: 'Information Technology',
        address: 'Ikoyi Street, Lagos',
        token: adminToken,
      };
      chai
        .request(server)
        .post('/api/v1/auth/create-user')
        .send(data)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.have.property('status').eql('success');
          done();
        });
    });
  });

  describe('POST /signin', () => {
    it('it should allow user to sign in', (done) => {
      const data = {
        email: 'obama@gmail.com',
        password: 'pass',
      };
      chai
        .request(server)
        .post('/api/v1/auth/signin')
        .send(data)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('status').eql('success');
          done();
        });
    });
  });
});
