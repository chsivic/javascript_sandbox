var http = require('http');
var url = require('url');
var items = [];
var server = http.createServer(function(req, res){
  switch (req.method) {
    // POST is for creating new item
    case 'POST': 
      var item = '';
      req.setEncoding('utf8');
      req.on('data', function(chunk){
        item += chunk;
      });
      req.on('end', function(){
        items.push(item);
        res.end('OK\n');
      });
      break; 
    // PUT is for modifying an item
    // http://localhost:3000/1 -X PUT -d "buy tickets"
    case 'PUT':
      var path = url.parse(req.url).pathname;
      var i = parseInt(path.slice(1), 10);
      if (isNaN(i)) {
        res.statusCode = 400;
        res.end('Invalid item id');
      } else if (!items[i]) {
        res.statusCode = 404;
        res.end('Item not found');
      } else {
        var item = '';
        req.setEncoding('utf8');
        req.on('data', function(chunk){
          item += chunk;
        });
        req.on('end', function(){
          items[i] = item;
          res.end('OK. '+i+') '+item+'\n');
        });
      }
      break;
      
    case 'GET':
      items.forEach(function(item, i){
        res.write(i + ') ' + item + '\n');
      });
      res.end();
      break;
    case 'DELETE':
      var path = url.parse(req.url).pathname;
      var i = parseInt(path.slice(1), 10);
      if (isNaN(i)) {
        res.statusCode = 400;
        res.end('Invalid item id');
      } else if (!items[i]) {
        res.statusCode = 404;
        res.end('Item not found');
      } else {
        items.splice(i, 1);
        res.end('OK\n');
      }
      break;
  }
});

server.listen(3000);
