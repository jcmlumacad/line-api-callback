'use strict';

var express = require('express'),
    app = express(),
    port = process.env.PORT || 5000;

app.post('/callback', function (req, res) {
    console.log(req);
});

app.listen(port, function () {
    console.log('Listen to port:', port);
});