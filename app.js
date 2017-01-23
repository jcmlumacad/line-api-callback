'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/callback', function (req, res) {
    console.log(req.body);
});

app.listen(port, function () {
    console.log('Listen to port:', port);
});