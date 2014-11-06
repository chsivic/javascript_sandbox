var http = require('http');
var formidable = require('formidable');
var parse = require('url').parse;
var socket = require('socket.io');

var server = http.createServer(function(req, res){

  switch (req.method) {
    case 'GET':
      show(req, res);
    break;
    case 'POST':
      upload(req, res);
    break;
  }
});

var io = socket(server); //http://socket.io/get-started/chat/

io.sockets.on('connection', function(socket){
  console.log('a user connected ');
  socket.join('sessionId');
});

server.on('connection', function(socket){
  console.log('http connected from '+socket.remoteAddress);
});

function show(req, res) {
  var html = ''
    + '<form method="post" action="/" enctype="multipart/form-data">'
    + '<p><input type="text" name="name" /></p>'
    + '<p><input type="text" name="progress" /></p>'
    + '<p><input type="file" name="file" /></p>'
    + '<p><input type="submit" value="Upload" name="upload_button"/></p>'
    + '</form>'
    + '<script src="/socket.io/socket.io.js"></script>'
    + "<script>var socket = io('http://localhost'); "
    + "  socket.on('progress', function(progress){"
    + "    console.log(progress);"
    + "    alert(progress)';"
    + "    document.getElementById('progress').value = progress;"
    + "  });"
    + "</script>";
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(html));
  res.end(html);
}
function upload(req, res) {
  if (!isFormData(req)) {
    res.statusCode = 400;
    res.end('Bad Request: expecting multipart/form-data');
    return;
  }

  var form = new formidable.IncomingForm();

  form.on('field', function(field, value){
    console.log('====== field =========');
    console.log('field = '+field);
    console.log('value = '+value);
  });

  form.on('file', function(name, file){
    console.log('------- file --------');
    console.log('name = '+name);
    console.log(file);
  });

  form.on('end', function(){
    res.end('upload complete!');
  });

  var last_percent = 0;
  form.on('progress', function(bytesReceived, bytesExpected){
    var percent = Math.floor(bytesReceived / bytesExpected * 100);
    if (percent != last_percent && percent - last_percent >= 5) {
      last_percent = percent;
      console.log(percent);
      io.sockets.emit('progress',percent);
    }
  });

  form.parse(req);
}
function isFormData(req) {
  var type = req.headers['content-type'] || '';
  return 0 == type.indexOf('multipart/form-data');
}


server.listen(3000, function(){
  console.log('listening on *:3000');
});
