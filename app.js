'use strict';

var express = require('express'),
    app = express(),
    port = 3000;

app.get('/', function (req, res) {
    console.log('Test');
    res.send('Test');
});

app.post('/callback', function (req, res) {
    console.log(res);
});

app.listen(port);
console.log('Listen to port:', port);