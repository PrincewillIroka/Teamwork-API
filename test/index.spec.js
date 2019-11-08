const expect = require('chai').expect
const server = require('../index')

describe('test', () => {
  it('should return a string', function(done) {
    expect('ci with travis').to.equal('ci with travis')
    done()
  })
})
