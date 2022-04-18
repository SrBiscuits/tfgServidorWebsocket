let Prototypes = require('./Utility/Prototypes') 

module.exports=class Connection{
    constructor(){
        this.socket;
        this.player;
        this.server;
        this.lobby;
    }

    createEvents(){
        let connection=this;
        let socket=connection.socket;
        let server= connection.server;
        let player=connection.player;

        socket.on('disconnect',function(){
            server.onDisconnected(connection);
        });
        socket.on('joinGame',function(){
            server.onAttemptToJoinGame(connection);
        });
        socket.on('fireBullet', function(data) {
            connection.lobby.onFireBullet(connection, data);
        });

        socket.on('collisionDestroy', function(data) {
            connection.lobby.onCollisionDestroy(connection, data);
        });
        socket.on('updatePosition',function(data){               
            player.position.x=data.position.x;
            player.position.y=data.position.y;
            player.position.z=data.position.z;
            let position = player.position.JSONData();
            position.x = new Number(position.x).formatNumber();
            position.y = new Number(position.y).formatNumber();
            position.z = new Number(position.z).formatNumber();
            
            socket.broadcast.to(connection.lobby.id).emit('updatePosition', {
                id: data.id,
                position: position
            });
            
            /*
            player.position.x = data.position.x;
            player.position.y = data.position.y;
            player.position.z = data.position.z;
            socket.broadcast.to(connection.lobby.id).emit('updatePosition', player);
            */
        });
        socket.on('updateRotation',function(data){
            player.gunRotation=data.gunRotation;
            player.playerRotation=data.playerRotation;
            socket.broadcast.to(connection.lobby.id).emit('updateRotation',player);
        });
        socket.on('playerHit',function(data){
            connection.lobby.OnPlayerHit(data);
        }); 
        socket.on('updateZombieRotation',function(data){
            //player.playerRotation=data.zombieRotation;
            //socket.broadcast.to(connection.lobby.id).emit('updateZombieRotation',player)
            socket.broadcast.to(connection.lobby.id).emit('updateZombieRotation', {
                id: data.id,
                zombieRotation: data.zombieRotation
            });
        });
    }
}