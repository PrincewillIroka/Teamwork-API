const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()
const server = require('../index')

chai.use(chaiHttp)

describe('Teamwork', () => {
  beforeEach(done => {
    chai
      .request(server)
      .get('/api/v1/auth/clear-db')
      .end((error, response) => {
        done()
      })
  })
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
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9iYW1hQGdtYWlsLmNvbSIsImlhdCI6MTU3MzUxNTkxMiwiZXhwIjoxNTczNTI2NzEyfQ.Eo5u9OzWBpBAXPz2ZILstzdKNyy4lCLafLVYF-oJO-s'
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
