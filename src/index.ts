import { OPEN, Server } from 'ws'
import * as express from 'express'
import chalk from 'chalk'
import * as url from 'url'
import * as http from 'http'

const app = express()

const server = http.createServer(app)
var wss = new Server({
  server
})

app.get('/users', function (_, res) {
  const userCount = wss.clients.size
  res.send({ user: userCount })
})


wss.on('connection', (ws: any, req: any) => {
  // GET user credential and store
  var query = url.parse(req.url, true).query
  var userId = query.userid
  if (!ws['uid']) {
    ws['uid'] = userId
  }
  ws.on('message', (ms) => {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === OPEN) {
        client.send(JSON.stringify({ msg: ms, from: ws.uid }));
      }
    })
  })
  ws.on('close', () => {
    // notify all other relavent people
    console.log('connection closed', ws.uid)
  })
  ws.on('error', (e) => console.log('errored', e.message))
})

server.listen(8080, () => console.log(chalk.bgGreen.gray(' OK '), chalk.blue('Server Started!')))
