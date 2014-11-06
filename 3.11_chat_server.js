var events = require('events');
var net = require('net');
var channel = new events.EventEmitter();
channel.clients = {};
channel.subscriptions = {};
channel.on('join', function(id, client) {
  console.log(id);
  console.log(client);
  this.clients[id] = client;
  this.subscriptions[id] = function(senderId, message) {
    if (id != senderId) {
      this.clients[id].write(message);
    } 
  }
  this.on('broadcast', this.subscriptions[id]);
});

channel.on('leave', function(id) {
  channel.removeListener(
    'broadcast', this.subscriptions[id]); 
  channel.emit('broadcast', id, id + " has left the chat.\n");
});


var server = net.createServer(function (client) {
  var id = client.remoteAddress + ':' + client.remotePort;
  console.log(id);
  client.on('connect', function() {
    console.log('client connect');
    channel.emit('join', id, client);
  });
  client.on('data', function(data) {
    data = data.toString();
    console.log('client data'+data.toString());
    channel.emit('broadcast', id, data);
  });
  client.on('close', function() {
    channel.emit('leave', id);
  });

});
server.listen(8888);

