
const Websocket = require('ws');

const portal=(process.env.PORT||5000);

const wsServer = new Websocket.Server({
    port: portal
})

wsServer.on('connection',function(socket){
    //Feedback
    console.log("a client just connected");
    //Behavior
    socket.on('message',function(msg){
        console.log("Recieved message from client: "+msg);
        //Reenviar
        socket.send("Resend message: "+msg);

        //Broadcast
        wsServer.clients.forEach(function(client){
            client.send("Reenviado a todos: "+msg);
        })
    })
})

