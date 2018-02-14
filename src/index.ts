import { OPEN,  Server } from 'ws'
import chalk from 'chalk'
import * as uuid from 'uuid'
import * as url from 'url'
import { IncomingMessage } from 'http';
var wss = new Server({
  port: 8080
}, () => console.log(chalk.bgGreen.gray(' OK '), chalk.blue('Server Started!')))

wss.on('connection', (ws: any, req: IncomingMessage) => {
  // GET user credential and store
  var userId = url.parse(req.url, true).query
  // console.log(req.url)
  if(!ws['uid']) {
    const uid = uuid()
    ws['uid'] = uid
    ws.send(JSON.stringify({ uid }))
  }
  ws.on('message', (ms) => {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === OPEN) {
        client.send(JSON.stringify({ msg: ms }));
      }
    })
  })
  ws.on('close', (ws) => {
    // notify all other relavent people
    console.log('connection closed')
  })
  ws.on('error', (e) => console.log('errored', e.message))
})
