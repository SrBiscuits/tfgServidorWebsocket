/*
const Websocket = require('ws');

const portal=(process.env.PORT||8080);

const wsServer = new Websocket.Server({
    port: portal
})

console.log("server open");

wsServer.on('connection',function(socket){
    //Feedback
    console.log("a client just connected.");
    //Behavior
    socket.on('message',function(msg){
        console.log("Recieved message from client: "+msg);
        //Reenviar
        socket.send("Resend message to a single client: "+msg);

        //Broadcast
        wsServer.clients.forEach(function(client){
            client.send("Reenviado a todos los clientes: "+msg);
        })
    })
})
*/
