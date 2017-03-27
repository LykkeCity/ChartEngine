const generator = require('./generator')

/* responses for /candles */
const mockResponses = [
  /* Respond with 400 Bad Request for PUT and DELETE - inappropriate on a collection */
  { request: { method: 'PUT' }, response: { status: 400 } },
  { request: { method: 'DELETE' }, response: { status: 400 } },
  {
    request: { method: 'GET' },
    response: function (ctx) {
      ctx.status = 400;
    }
  },
  {
    /* for POST requests, create a new user and return the path to the new resource */
    request: { method: 'POST' },
    response: function (ctx, asset) {
      const body = ctx.request.body;
      
      //ctx.body = `<h1>asset: ${asset}, period: ${body.period}, type: ${body.type}, from: ${body.dateFrom}, to: ${body.dateTo}</h1>`
      
      ctx.body = { 
        assetPair: asset,
        period: body.period,
        dateFrom: body.dateFrom,
        dateTo: body.dateTo,
        type: body.type,
        data: generator.generate(asset, body.period, body.dateFrom, body.dateTo)
      };
      ctx.status = 200;
      ctx.type = 'application/json; charset=utf-8';
      //ctx.response.set('Location', `/users/${newUser.id}`)
    }
  },
]

module.exports = mockResponses