var util = require('util');
var Transform = require('stream').Transform;
util.inherits(Parser, Transform);

function Parser(options) {
  if (!options)
    options = {};

  if (!(this instanceof Parser))
    return new Parser(options);

  Transform.call(this, options);
  this._writableState.objectMode = false;
  this._readableState.objectMode = true;

  this.buffer = [];
  this.separator = /\n/;
}

Parser.prototype._transform = function(chunk, encoding, done) {
  var chunkString = chunk.toString();
  if (this.separator.test(chunkString)) {
    var parts = chunkString.split(this.separator);
    this.buffer.push(parts.shift());
    this.push(JSON.parse(this.buffer.join(''))+'\n');
    var nParts = parts.length;
    for (var i = 0; i < nParts -1; i++) {
      this.push(JSON.parse(parts.shift())+'\n');
    }
    this.buffer = [];
    this.buffer.push(parts.shift());
  } else
    this.buffer.push(chunkString);

  done();
};

module.exports = Parser;
