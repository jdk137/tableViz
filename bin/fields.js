var fs = require('fs');

var fields = [];
for (var i = 1; i < 4; i++) {
  fields.push(fs.readFileSync('./data/' + i + '.txt', 'utf-8').split(",").map(function (field) {
    return field.replace(/\r\n/g, '').trim();
  }));
}
console.log(fields);