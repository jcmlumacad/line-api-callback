'use strict';

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    util = require('util'),
    request = require('request'),
    http = require('http'),
    server = http.createServer(app),
    port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    var userId = req.query.user_id;
    console.log('user id:', userId);
    res.sendFile(__dirname + '/index.html');
});

app.post('/callback', function (req, res) {
    console.log('got post request.');
    console.log(req.body);
    console.log(req.body.events[0].replyToken);
    var userId = req.body.events[0].source.userId;
    var eventType = req.body.events[0].type;
    console.log('event type from LINE:' + req.body.events[0].type);
    if (eventType == 'message') {
        var text = req.body.events[0].message.text;
    }

    var io = require('socket.io-client');
    var socket = io('https://line-api-callback.herokuapp.com:80');
    socket.on('connected', function () {
        socket.emit('init', { 'room': userId, 'name': 'conrad' });
        socket.emit('chat message', '[LINE]' + text);
    });

    var username = '51b1d94f-026a-4d82-93de-98dd339aacdc',
        password = 'aUwwBVMaIkmF',
        id = 'cbe98f28-87d6-45f5-8ff7-792295ae7b69',
        workspace = 'db31651d-1472-4685-b0e6-c6b60c97762b',
        url = 'https://gateway.watsonplatform.net/conversation/api/v1/workspaces/' + workspace + '/message?version=2016-09-20';

    var ConversationV1 = require('watson-developer-cloud/conversation/v1');

    var conversation = new ConversationV1({
        username: username,
        password: password,
        path: { workspace_id: workspace },
        version_date: '2016-07-11'
    });

    conversation.message({
        input: { text: text },
        context: {
            conversation_id: id,
            system: {
                dialog_stack: [
                    {
                        dialog_node: 'root'
                    }
                ],
                dialog_turn_counter: 2,
                dialog_request_counter: 2
            },
            defaultCounter: 0
        }
    }, function (err, res) {
        if (err) {
            console.error(err);
            return;
        }

        if (res.output.text.length != 0) {
            var message = '';
            var message1 = res.output.text[0];
            var message2 = res.output.text[1];

            if (message1) {
                message = message1;   
            }

            if (message2) {
                message = message2;
            }

            console.log('Response from Bluemix:', message);

            var io = require('socket.io-client');
            var socket = io('https://line-api-callback.herokuapp.com:80');
            socket.on('connected', function () {
                socket.emit('init', { 'room': userId, 'name': 'conrad' });
                socket.emit('chat message', '[BOT]' + message);
            });

            url = 'https://line-api-callback.herokuapp.com/push?message=' + message + '&user_id=' + userId;
            request(url, function (err, res, body) {});
        }
    });

    res.send('OK');
});

app.get('/push', function (req, res) {
    var accessToken = 'BHf8wqLBzJ9C6iBetAv7xgWH4lzFvSk7HObFl8SRmFuZiMJ4i19IgZ9NIz8Pgffz3uvUae6KWbw7b0wMjCs5dd7praRSiiqmiNDIf1uGlXnaLOwaR6rgNfjAIM/IGs46NA12zpY91+5xUVbDPniBxQdB04t89/1O/w1cDnyilFU=';
    var message = req.query.message;
    var userId = req.query.user_id;

    var options = {
        url: 'https://api.line.me/v2/bot/message/push',
        port: 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charser=UTF-8',
            'Authorization': 'Bearer ' + accessToken
        },
        json: true,
        body: {
            'to': userId,
            'messages': [
                {
                    'type': 'text',
                    'text': message
                }
            ]
        }
    };

    request.post(options, function (err, res, body) {});
});

var io = require('socket.io')(server);
io.sockets.on('connection', function (socket) {
    console.log('in io.on');
    socket.emit('connected');
    socket.on('init', function (req) {
        console.log('in init');
        socket.room = req.room;
        socket.name = req.name;
        console.log('in init room:', socket.room);
        console.log('in init name:', socket.name);
        socket.to(req.room).emit('chat message', req.name + " joined");
        socket.join(req.room);
    });

    console.log('a user connected');
    socket.on('chat message', function (message) {
        console.log('socket room:', socket.room);
        console.log('socket name:', socket.name);
        console.log('socket message:', message);
        io.to(socket.room).emit('chat message', 'Message: ' + message);
    });
});

server.listen(port, function () {
    console.log('Listening to port:', port);
});