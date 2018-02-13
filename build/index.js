"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const chalk_1 = require("chalk");
const uuid = require("uuid");
const url = require("url");
var wss = new ws_1.Server({
    port: 8080
}, () => console.log(chalk_1.default.bgGreen.gray(' OK '), chalk_1.default.blue('Server Started!')));
wss.on('connection', (ws, req) => {
    console.log(url.parse(req.url, true).query);
    // console.log(req.url)
    if (!ws['uid']) {
        const uid = uuid();
        ws['uid'] = uid;
        ws.send(JSON.stringify({ uid }));
    }
    ws.on('message', (ms) => {
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === ws_1.OPEN) {
                client.send(JSON.stringify({ msg: ms }));
            }
        });
    });
    ws.on('close', () => {
        // notify all other relavent people
        console.log('connection closed');
    });
    ws.on('error', (e) => console.log('errored', e.message));
});
//# sourceMappingURL=index.js.map