var test = require('tap').test;
var Readable = require('stream').Readable;
var Parser = require('../').Parser;
var Stringifier = require('../').Stringifier;
var PassThrough = require('stream').PassThrough;

var n = 100;
var nsjrs = new Readable();
nsjrs._read = function _read () {
  if (!--n)
    this.push('{"this": "is", "js": "on"}\n');
  else
    this.push(null);
}

test('parses and stringifies', function (t) {
  var parser = new Parser();
  nsjrs.pipe(parser);

  var tr = new PassThrough();
  var stringifier = new Stringifier;
  parser.pipe(tr);
  tr.pipe(process.stdout);

  tr.on('end', function () {
    t.end();
  });
});
