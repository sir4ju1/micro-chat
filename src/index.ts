import { OPEN, CLOSED, Server } from 'ws'
import chalk from 'chalk'
import * as url from 'url'


var clients = new Map()

var wss = new Server({
  port: 8080
}, () => console.log(chalk.bgGreen.gray(' OK '), chalk.blue('Server Started!')))

wss.on('connection', (ws: any, req: any) => {
  // GET user credential and store
  var query = url.parse(req.url, true).query
  var userId = query.userid
  if (userId) {
    ws['uid'] = userId
    clients.set(userId, ws.send.bind(ws))
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === OPEN) {
        client.send(JSON.stringify({ type: 0, isOnline: true, from: ws.uid }))
      }
    })
  }
  ws.on('message', (ms) => {
    var data = JSON.parse(ms)
    /**
     * types for message
     * 1: send direct message to specific friend
     * 2: fetch online friendes
     * 3: send message to all friends
     * default: pong
     */
    switch (data.type) {
      case 1:
        var msg = JSON.stringify({ type: 1, msg: data.msg, from: ws.uid })
        var b = clients.get(data.to)
        b(msg)
        break
      case 2:
        var friends = Array.from(clients.keys())
        friends = friends.filter(f => {
          if (f !== ws.uid) return f
        })
        var strMsg = JSON.stringify({ type: 2, friends })
        wss.clients.forEach(function each(client) {
          if (client === ws && client.readyState === OPEN) {
            client.send(strMsg)
          }
        })

        break
      case 3:
        // send msg to all friend
        wss.clients.forEach(function each(client) {
          if (client !== ws && client.readyState === OPEN) {
            client.send(JSON.stringify({ type: 1, msg: data.msg, from: ws.uid }))
          }
        })
        break
      default:
        // nothing for now
        
        break;
    }

  })
  ws.on('close', () => {
    // notify all other friends about offline status
    clients.delete(ws.uid)
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === OPEN) {
        client.send(JSON.stringify({ type: 0, isOnline: false, from: ws.uid }))
      }
    })
    console.log('connection closed', ws.uid)
  })
  ws.on('error', (e) => console.log('errored', e.message))
})
