let Prototypes = require('./Utility/Prototypes'); 
const Vector3 = require('./Vector3');

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
            if(connection!=undefined && connection.lobby!=undefined && connection.lobby.id!=undefined){
                connection.lobby.onFireBullet(connection, data);
            }
        });

        socket.on('collisionDestroy', function(data) {
            if(connection!=undefined && connection.lobby!=undefined && connection.lobby.id!=undefined){
                connection.lobby.onCollisionDestroy(connection, data);
            }
        });
        socket.on('updatePosition',function(data){               
            player.position.x=data.position.x;
            player.position.y=data.position.y;
            player.position.z=data.position.z;
            let position = player.position.JSONData();
            position.x = new Number(position.x).formatNumber();
            position.y = new Number(position.y).formatNumber();
            position.z = new Number(position.z).formatNumber();
            
            if(connection!=undefined && connection.lobby!=undefined && connection.lobby.id!=undefined){
                socket.broadcast.to(connection.lobby.id).emit('updatePosition', {
                    id: data.id,
                    position: position
                });
            }          
            /*
                Otro posible metodo que no funciona por el cultureinfo, los floats llegan en mal estado al cliente
                player.position.x = data.position.x;
                player.position.y = data.position.y;
                player.position.z = data.position.z;
                socket.broadcast.to(connection.lobby.id).emit('updatePosition', player);
            */
        });
        socket.on('animationNumber',function(data){
            if(connection!=undefined && connection.lobby!=undefined && connection.lobby.id!=undefined){
                socket.broadcast.to(connection.lobby.id).emit('animationNumber', {
                    id:data.id,
                    animation:data.animation
                });
            }      
        });
        socket.on('animationDirection',function(data){
            if(connection!=undefined && connection.lobby!=undefined && connection.lobby.id!=undefined){
                socket.broadcast.to(connection.lobby.id).emit('animationDirection', {
                    id:data.id,
                    X:data.X,
                    Z:data.Z
                });
            }
        });
        socket.on('updateRotation',function(data){
            player.gunRotation=data.gunRotation;
            player.playerRotation=data.playerRotation;
            if(connection!=undefined && connection.lobby!=undefined && connection.lobby.id!=undefined){
                socket.broadcast.to(connection.lobby.id).emit('updateRotation',player);
            }
        });
        
        socket.on('updateZombiePosition',function(data){
            let location=new Vector3();               
            location.x=data.position.x;
            location.y=data.position.y;
            location.z=data.position.z;
            let position = location.JSONData();
            position.x = new Number(position.x).formatNumber();
            position.y = new Number(position.y).formatNumber();
            position.z = new Number(position.z).formatNumber();
            if(connection!=undefined && connection.lobby!=undefined && connection.lobby.id!=undefined){
                socket.broadcast.to(connection.lobby.id).emit('updatePosition', {
                    id: data.id,
                    position: position
                });
            }
        });
        socket.on('playerHit',function(data){
            if(connection!=undefined && connection.lobby!=undefined && connection.lobby.id!=undefined){
                connection.lobby.OnPlayerHit(data);
            }
        }); 
        socket.on('updateZombieRotation',function(data){
            if(connection!=undefined && connection.lobby!=undefined && connection.lobby.id!=undefined){
                socket.broadcast.to(connection.lobby.id).emit('updateZombieRotation', {
                    id: data.id,
                    zombieRotation: data.zombieRotation
                });
            }
        });
        socket.on('startGame',function(data){
            server.onStartLobby(data.id);
        }); 
        socket.on('exitGame',function(data){
            server.onEndLobby(data.id);
        }); 
        socket.on('swapHost',function(data){
            server.swapHost(data.id);
        });
    }
}