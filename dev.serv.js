import coRequest from 'co-request'
import send from 'koa-send'
import createApp from './server/app'
import api from './server/api'

const router = require('koa-router')()
router.get('/static/**/*.js(on)?', async function (ctx, next) {
  let options = {
    uri: 'http://localhost:5001' + ctx.url,
    mothed: 'GET',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-Cache'
    }
  }
  let response = await coRequest(options)
  for (let key in response.headers) {
    ctx.set(key, response.headers[key])
  }
  ctx.body = response.body
})

router.get('/static/*', async function (ctx, next) {
  await send(ctx, ctx.path)
})

// server ====================================
const app = createApp({
  debug: true,
  engine: 'tingodb'
})

app.use(router.routes())

app.listen(5000, () => {
  console.log('hydra server start at 5000')
})

// api server =================================
api.start({ port: 5002 })
