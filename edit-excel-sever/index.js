const Koa = require('koa');
const bodyParser = require('koa-bodyparser')

const { socketHelper } = require('./socket/index.js')
const appRoters = require('./routers/index.js')

const app = new Koa();
app.use(bodyParser())
app.use(appRoters.routes())

setTimeout(() => {
  socketHelper.initWss(app)
  socketHelper.initSocket()

  const server = socketHelper.server
  const port = 3011;
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}, 3000)