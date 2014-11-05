var http = require('http');
var formidable = require('formidable');
var parse = require('url').parse;
var io = require('socket.io')(server); //http://socket.io/get-started/chat/

io.on('connection', function(socket){
  console.log('a user connected '+io.id);
  socket.join('sessionId');
});

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

function show(req, res) {
  var html = ''
    + '<form method="post" action="/" enctype="multipart/form-data">'
    + '<p><input type="text" name="name" /></p>'
    + '<p><input type="file" name="file" /></p>'
    + '<p><input type="submit" value="Upload" name="upload_button"/></p>'
    + '</form>'
    + '<script src="https://cdn.socket.io/socket.io-1.2.0.js"></script>'
    + '<script src="http://code.jquery.com/jquery-1.11.1.js"></script>'
    + "<script>var socket = io(); "
    + "  socket.on('progress', function(progress){"
    + "    console.log(progress);"
    + "    alert(progress)';"
    + "    $('#name').val(progress+'%');"
    + "  });"
    + "    $('#name').val('val test'+'%');"
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
    console.log('file = '+file);
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
      io.sockets.in('sessionId').emit('progress', percent);
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
