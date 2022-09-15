//ws://1:80/socket.io/?EIO=3&transport=websocket
//ws://tfgzombieswebsocket.herokuapp.com:80/socket.io/?EIO=3&transport=websocket
var io = require('socket.io')(process.env.PORT||52300);
let Server = require('./Classes/Server')
let server=new Server();

console.log('Server has started');

//updates cada 100 milisegundos de forma infinita
setInterval(()=>{
    server.onUpdate();
},100,0);

io.on('connection',function(socket){
    let connection=server.onConnected(socket);
    connection.createEvents();
    connection.socket.emit('register',{'id':connection.player.id});
});
