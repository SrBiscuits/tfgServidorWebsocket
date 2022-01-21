
const Websocket = require('ws');
const express = require('express');
const app=express()

app.get("/",function(res,req){
    res.send("working")
})

app.listen(process.env.PORT||5000)

const PORT=5000;

const wsServer = new Websocket.Server({
    port: PORT
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

console.log((new Date())+"Server is listening on port "+PORT);