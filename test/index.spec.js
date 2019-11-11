const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()
const server = require('../index')

chai.use(chaiHttp)

describe('Teamwork', () => {
  describe('/POST create-user', () => {
    it('it should create an employee user account', done => {
      const data = {
        firstName: 'Steve',
        lastName: 'Jobs',
        email: 'jobs@gmail.com',
        password: 'pass',
        gender: 'Male',
        jobRole: 'Software Developer',
        department: 'Information Technology',
        address: 'Ikoyi Street, Lagos',
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9iYW1hQGdtYWlsLmNvbSIsImlhdCI6MTU3MzUxNDc3MSwiZXhwIjoxNTczNTE1MDcxfQ.o-fLKF1uZdKx297DvNr8G1q9T40QMi1K5UkZEf4GZXk'
      }
      chai
        .request(server)
        .post('/api/v1/auth/create-user')
        .send(data)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.have.property('status').eql('success')
          done()
        })
    })
  })
})
