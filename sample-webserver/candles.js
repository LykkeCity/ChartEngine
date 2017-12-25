const generator = require('./generator')

/* responses for /candles */
const mockResponses = [
  { request: { method: 'PUT' }, response: { status: 400 } },
  { request: { method: 'DELETE' }, response: { status: 400 } },
  { request: { method: 'GET' }, response: function (ctx) { ctx.status = 400; } },
  {
    request: { method: 'POST' },
    response: function (ctx, asset) {
      const body = ctx.request.body;
      
      ctx.body = { 
        assetPair: asset,
        period: body.period,
        dateFrom: body.dateFrom,
        dateTo: body.dateTo,
        type: body.type,
        data: generator.generateComputed(asset, body.period, body.dateFrom, body.dateTo)
      };
      ctx.status = 200;
      ctx.type = 'application/json; charset=utf-8';
    }
  },
]

module.exports = mockResponses