// shamelessly borrowed from http://nodejs.org/api/stream.html

var util = require('util');
var StringDecoder = require('string_decoder').StringDecoder;
var Transform = require('stream').Transform;
if (!Transform)
  Transform = require('readable-stream').Transform; // for browsers and node pre-0.10
util.inherits(Parser, Transform);

function Parser(options) {
  if (!(this instanceof Parser))
    return new Parser(options);

  Transform.call(this, options);
  this._writableState.objectMode = false;
  this._readableState.objectMode = true;
  this._buffer = '';
  this._decoder = new StringDecoder('utf8');
}

Parser.prototype._transform = function(chunk, encoding, cb) {
  this._buffer += this._decoder.write(chunk);
  var lines = this._buffer.split(/\r?\n/);
  this._buffer = lines.pop();
  for (var l = 0; l < lines.length; l++) {
    var line = lines[l];
    try {
      var obj = JSON.parse(line);
      this.push(obj);
    } catch (er) {
      var context = lines.slice(l).join('\n')+'\n'+this._buffer;
      er = new Error(er.message+' in '+JSON.stringify(context));
      this.emit('error', er);
      return;
    }
  }
  cb();
};

Parser.prototype._flush = function(cb) {
  var rem = this._buffer.trim();
  if (rem) {
    try {
      var obj = JSON.parse(rem);
      this.push(obj);
    } catch (er) {
      this.emit('error', er);
      return;
    }
  }
  cb();
};

module.exports = Parser;
