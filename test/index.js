/* global describe, beforeEach, afterEach, it */
const request = require('supertest')
const mockFields = require('..')
const Koa = require('koa')

const app = new Koa()

app.use(mockFields())

app.use(function * (next) {
  if (this.path === '/array') return yield next

  this.body = {
    name: 'tobi',
    email: 'tobi@segment.io',
    packages: 5,
    friends: ['tobi', 'loki', 'jane'],
    location: { id: '342', name: 'London' }
  }
})

app.use(function * () {
  this.body = [
    {
      name: 'tobi',
      email: 'tobi@segment.io',
      packages: 5,
      friends: ['abby', 'loki', 'jane'],
      location: { id: '342', name: 'London' }
    },
    {
      name: 'loki',
      email: 'loki@segment.io',
      packages: 2,
      friends: ['loki', 'jane'],
      location: { id: '62', name: 'New York' }
    }
  ]
})

describe('fields()', () => {
  let server

  beforeEach(() => (server = app.listen()))
  afterEach(() => server.close())

  describe('when ?fields is missing', () => {
    it('should be ignored', function * () {
      yield request(server)
          .get('/')
          .expect(200)
    })
  })

  describe('when ?fields is present', () => {
    describe('with one property', () => {
      it('should fields that property', function * () {
        yield request(server)
          .get('/?fields=name,location/name')
          .expect({ name: 'tobi', location: { name: 'London' } })
      })
    })

    describe('with an array response', () => {
      it('should fields each document', function * () {
        yield request(server)
          .get('/array?fields=name,location/name')
          .expect([
            { name: 'tobi', location: { name: 'London' } },
            { name: 'loki', location: { name: 'New York' } }
          ])
      })
    })

    describe('with multiple properties', () => {
      it('should split on commas', function * () {
        yield request(server)
          .get('/?fields=name,packages')
          .expect({ name: 'tobi', packages: 5 })
      })
    })
  })
})
