const assets = require('./assets.json')

/* responses for /users */
const mockResponses = [
  /* Respond with 400 Bad Request for PUT and DELETE - inappropriate on a collection */
  { request: { method: 'PUT' }, response: { status: 400 } },
  { request: { method: 'DELETE' }, response: { status: 400 } },
  { request: { method: 'POST' }, response: { status: 400 } },
  {
    request: { method: 'GET' },
    response: function (ctx) {
      ctx.body = assets
    }
  }
]

module.exports = mockResponses