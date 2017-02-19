var path = require('path');
var fs = require('fs');
var connect = require('connect');

var app = connect();
app.use(connect.static(path.join(__dirname, "../")));
app.use(connect.directory(path.join(__dirname, "../")));
app.use(connect.query());
app.listen(process.argv[2]);
console.log("Running at http://localhost:" + process.argv[2]);
