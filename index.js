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



/*var Player = require('./Classes/Player.js');
const Vector3 = require('./Classes/Vector3');
*/

/*var players = [];
var sockets = [];

io.on('connection',function(socket){
    console.log('connection made');

    var player = new Player();
    var thisPlayerID= player.id;

    players[thisPlayerID]=player;
    socket[thisPlayerID]=socket;

    socket.emit('register',{id:thisPlayerID});
    socket.emit('spawn',player);
    socket.broadcast.emit('Otherspawn',player);

    //Spawn de clientes para cada cliente
    for(var playerID in players){
        if(playerID!=thisPlayerID){
            socket.emit('Otherspawn',players[playerID]);
        }
    }

    //Posiciones players
    socket.on('updatePosition',function(data){
        player.position.x=data.position.x;
        player.position.y=data.position.y;
        player.position.z=data.position.z;
        let position = player.position.JSONData();
        position.x = new Number(position.x).formatNumber();
        position.y = new Number(position.y).formatNumber();
        position.z = new Number(position.z).formatNumber();
        
        socket.broadcast.emit('updatePosition', {
            id: data.id,
            position: position
        });
    })

    socket.on('updateRotation',function(data){
        let myData = JSON.stringify(data);
        console.log(`${myData}`);
        player.gunRotation=data.gunRotation;
        player.playerRotation=data.playerRotation;

        socket.broadcast.emit('updateRotation',player);
    });

    //Desconexión
    socket.on('disconnect',function(){
        console.log('desconectado');
        delete players[thisPlayerID];
        delete sockets[thisPlayerID];
        socket.broadcast.emit('disconnected',player);
    });

    socket.on('message',function(){
        console.log("mensaje recibido");       
    });
});*/