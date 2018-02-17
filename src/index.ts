import { OPEN, Server } from 'ws'
import chalk from 'chalk'
import * as url from 'url'


var clients = new Map()

var wss = new Server({
  port: 8080
},() => console.log(chalk.bgGreen.gray(' OK '), chalk.blue('Server Started!')))

wss.on('connection', (ws: any, req: any) => {
  // GET user credential and store
  var query = url.parse(req.url, true).query
  var userId = query.userid
  if (userId) {
    ws['uid'] = userId
    clients.set(userId, ws.send)
  }
  ws.on('message', (ms) => {
    var data = JSON.parse(ms)
    /**
     * types for message
     * 1: send direct message to specific friend
     * 2: fetch online friendes
     * 3: send message to all friends
     * default: pong message
     */
    switch (data.type) {
      case 1:
          var msg = { msg: data.msg, from: ws.uid }
          clients.get(data.to)(msg)
        break
      case 2:
        break
      case 3:
        // check for friends and send online status to all
        break
      default:
        wss.clients.forEach(function each(client) {
          if (client !== ws && client.readyState === OPEN) {
            client.send(JSON.stringify({ msg: ms, from: ws.uid }))
          }
        })
        break;
    }

  })
  ws.on('close', () => {
    // notify all other friends about offline status
    console.log('connection closed', ws.uid)
  })
  ws.on('error', (e) => console.log('errored', e.message))
})
