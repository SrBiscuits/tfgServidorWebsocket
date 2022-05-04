let LobbyBase=require('./LobbyBase')
let GameLobbySettings=require('./GameLobbySettings')
let Connection=require('../Connection')
let Bullet = require('../Bullet')
let Vector3=require('../Vector3')
let ServerItem=require('../Utility/ServerItem')
let AIBase=require('../AI/AIBase')
let ZombieAI=require('../AI/ZombieAI')
let MaxAmmo=require('../Items/MaxAmmo')
let LobbyState =require('../Utility/LobbyState.js')
const ItemBase = require('../Items/ItemBase')

module.exports = class GameLobbby extends LobbyBase {
    constructor(settings = GameLobbySettings) {
        super(); //Heredar
        this.lobbyUpdate=false;
        this.settings = settings;
        this.lobbyState=new LobbyState();
        this.endGameLobby = function() {};
        this.bullets = [];
        this.zombieSpawnTimeCounter=Number(0);
        this.maxZombiesReached=false;
        this.totalZombies=Number(0);
        this.allZombiesSpawned=Number(0);
        this.maxZombies=Number(10);
        this.allZombiesRound=Number(6);
        this.roundComplete=false;
        this.nextRoundTimeCounter=Number(0);
        this.round=Number(1);
        this.zombies=Number(0);
    }
    onUpdate() {
        let lobby = this;
        if(this.lobbyUpdate)
        {
            super.onUpdate();
            lobby.updateBullets();
            lobby.updateZombies();
            lobby.updateRound();
            lobby.updateItems();
            let aiList = lobby.serverItems.filter(item => {return item instanceof AIBase;});
            aiList.forEach(ai => {
                let respawn=ai.onCanRespawn();
            });
        }
    }
    updateZombies(){
        this.zombieSpawnTimeCounter+=0.1;
        //console.log(this.zombieSpawnTimeCounter);
        if(this.zombieSpawnTimeCounter>=3 && this.totalZombies<this.allZombiesRound && this.zombies<this.maxZombies){
            this.zombies+=1;
            this.totalZombies+=1;
            this.allZombiesSpawned+=1;
            this.zombieSpawnTimeCounter=0;
            console.log("currentZombies: "+this.totalZombies+" allzombiesRound: "+this.allZombiesRound+" currentZombies: "+this.zombies)
            //console.log("Actual zombies: "+this.zombies+" Max zombies: "+this.maxZombies+" Round: "+this.round+" All zombies: "+this.allZombiesRound); 
            if(this.allZombiesSpawned>9)
            {
                this.maxZombiesReached=true;
            }
            this.onSpawnAIIntoGame();
        }
        else if(this.totalZombies==this.allZombiesRound)
        {
            this.roundComplete=true;
        }  
    }
    updateRound()
    {
        let lobby = this; 
        if(this.roundComplete){
            let AllZombiedDead=true;
            let aiList = lobby.serverItems.filter(item => {return item instanceof AIBase;});
            aiList.forEach(ai => {
                //console.log(!ai.isDead);
                if(!ai.isDead)
                {
                    AllZombiedDead=false;
                }
            });   
            if(AllZombiedDead){
                this.nextRoundTimeCounter+=0.1;
                console.log("timer: "+this.nextRoundTimeCounter);
                if(this.nextRoundTimeCounter>=20){
                    this.round+=1;
                    this.roundComplete=false;
                    this.zombies=0;
                    this.totalZombies=0;
                    this.nextRoundTimeCounter=0;
                    this.allZombiesRound+=6;
                }
            }
        }
    }
    updateBullets() 
    {
        let lobby = this;
        let bullets = lobby.bullets;
        let connections = lobby.connections;
        bullets.forEach(bullet => {
            let isDestroyed = bullet.onUpdate();

            if(isDestroyed) {           
                lobby.despawnBullet(bullet);
            } else {/*
                var returnData = {
                    id: bullet.id,
                    position: {
                        x: bullet.position.x,
                        y: bullet.position.y,
                        z: bullet.position.z
                    }
                }
                connections.forEach(connection => {
                    connection.socket.emit('updateBulletPosition', returnData);
                });*/
            }
        });
    }
    updateItems()
    {
        let lobby=this;
        let items=lobby.serverItems;
        let connections=lobby.connections;
        let itemList = items.filter(item => {return item instanceof ItemBase;});

        itemList.forEach(item => {
            let colision=item.onCheckColision(connections);
            let time=item.updateTime();
            if(time){
                lobby.onServerUnspawn(item);
            }
            if(colision){
                connections.forEach(connection=>{
                    connection.socket.emit('itemUsed',{
                        id:item.id,
                        name:item.username
                    });
                });
                lobby.onServerUnspawn(item);     
            }
        });
    }
    canEnterLobby(connection = Connection) {
        let lobby = this;
        let maxPlayerCount = lobby.settings.maxPlayers;
        let currentPlayerCount = lobby.connections.length;

        if(currentPlayerCount + 1 > maxPlayerCount) {
            return false;
        }

        return true;
    }
    onEnterLobby(connection = Connection) {
        let lobby = this;
        let socket=connection.socket;
        super.onEnterLobby(connection);

        let returnData={
            state:lobby.lobbyState.currentState,
            players:lobby.connections.length,
            id:lobby.id
        };

        socket.emit('loadGame');
        socket.emit('lobbyUpdate',returnData);
        socket.broadcast.to(lobby.id).emit('lobbyUpdate',returnData);
    }
    onLeaveLobby(connection = Connection) {
        let lobby = this;
        let socket=connection.socket;
        super.onLeaveLobby(connection);

        lobby.removePlayer(connection);
        
        let returnData={
            state:lobby.lobbyState.currentState,
            players:lobby.connections.length,
            id:lobby.id
        };
        socket.broadcast.to(lobby.id).emit('lobbyUpdate',returnData);
        //Handle unspawning any server spawned objects here
        //Example: loot, perhaps flying bullets etc
        lobby.onUnspawnAllAIInGame(connection);
    }
    onStartGame()
    {
        let lobby=this;
        let connection=this.connections[0];
        let socket=connection.socket;

        lobby.lobbyState.currentState=lobby.lobbyState.GAME;
        let returnData={
            state:lobby.lobbyState.currentState,
            players:lobby.connections.length,
            id:lobby.id
        };

        socket.emit('lobbyUpdate',returnData);
        socket.broadcast.to(lobby.id).emit('lobbyUpdate',returnData);
        lobby.onSpawnAllPlayersInGame();
        this.lobbyUpdate=true;
    }
    onSpawnAllPlayersInGame()
    {
        let lobby=this;
        let connections=lobby.connections;

        connections.forEach(connection=>{
            lobby.addPlayer(connection);
        })
    }
    addPlayer(connection = Connection) {
        let lobby = this;
        let connections = lobby.connections;
        let socket = connection.socket;

        var returnData = {
            id: connection.player.id
        }

        socket.emit('spawn', returnData); //Avisarme
        connections.forEach(c => { //Avisar a otros
            if(c.player.id != connection.player.id) {
                socket.emit('Otherspawn', {
                    id: c.player.id
                });
            }
        });
    }
    onSpawnAIIntoGame(){
        
        let lobby=this;

        if(this.maxZombiesReached)
        {
            let found=false;
            let aiList = lobby.serverItems.filter(item => {return item instanceof AIBase;});
            aiList=aiList.reverse();
            aiList.forEach(ai => {
                if(ai.isDead && found==false && ai.canRespawn)
                {
                    ai.respawn(this.round);
                    found=true;
                    var returnData = {
                        id: ai.id/*,
                        position: {
                            x: ai.position.x,
                            y: ai.position.y,
                            z: ai.position.z
                        },*/
                    }
                    console.log("zombie respawned with id"+returnData.id);
                    lobby.connections[0].socket.emit('playerRespawn', returnData);
                    lobby.connections[0].socket.broadcast.to(lobby.id).emit('playerRespawn', returnData);           
                }
            }); 
        }
        else
        {
            lobby.onServerSpawn(new ZombieAI(),new Vector3());
        } 
    }
    onUnspawnAllAIInGame(connection=Connection){
        let lobby=this;
        let serverItems=lobby.serverItems;
        
        //Despawnear items solo para el cliente que se ha ido
        serverItems.forEach(serverItem=>{
            connection.socket.emit('serverUnspawn',{
                id:serverItem
            })
        });
    }
    onFireBullet(connection = Connection, data) {
        let lobby = this;

        let bullet = new Bullet();
        bullet.name = 'Bullet';
        bullet.activator = data.activator;
        bullet.position.x = data.position.x;
        bullet.position.y = data.position.y;
        bullet.position.z = data.position.z;
        bullet.direction.x = data.direction.x;
        bullet.direction.y = data.direction.y;
        bullet.direction.z = data.direction.z;

        lobby.bullets.push(bullet);

        var returnData = {
            name: bullet.name,
            id: bullet.id,
            activator: bullet.activator,
            position: {
                x: bullet.position.x,
                y: bullet.position.y,
                z: bullet.position.z
            },
            direction: {
                x: bullet.direction.x,
                y: bullet.direction.y,
                z: bullet.direction.z
            },
            speed: bullet.speed
        }

        connection.socket.emit('serverSpawn', returnData);
        connection.socket.broadcast.to(lobby.id).emit('serverSpawn', returnData); //Only broadcast to those in the same lobby as us
    }
    despawnBullet(bullet = Bullet) {
        let lobby = this;
        let bullets = lobby.bullets;
        let connections = lobby.connections;

        console.log('Destroying bullet (' + bullet.id + ')');
        var index = bullets.indexOf(bullet);
        if(index > -1) {
            bullets.splice(index, 1);

            var returnData = {
                id: bullet.id
            }

            //Send remove bullet command to players
            connections.forEach(connection => {
                connection.socket.emit('serverUnspawn', returnData);
            });
        }
    }
    onCollisionDestroy(connection = Connection, data) {
        let lobby = this;

        let returnBullets = lobby.bullets.filter(bullet => {
            return bullet.id == data.id
        });

        returnBullets.forEach(bullet => {
            let aiList = lobby.serverItems.filter(item => {return item instanceof AIBase;});
            aiList.forEach(ai => {
                if (bullet.activator != ai.id) {                  
                    if (ai.id==data.zombieID) {
                        let isDead = ai.dealDamage(data.damage);
                        if (isDead) {
                            console.log('Ai has died');
                            this.zombies-=1;
                            let returnData = {
                                id: ai.id,
                                username : ai.username
                            }
                            //Por el remoto caso de que el ultimo jugador se vaya pero la bala de a alguien mientras no hay nadie
                            lobby.connections[0].socket.emit('playerDied', returnData);
                            lobby.connections[0].socket.broadcast.to(lobby.id).emit('playerDied', returnData);
                            var randomNumber=lobby.getRandomInt(15);
                            if(randomNumber==0){
                                lobby.onServerSpawn(new MaxAmmo(),new Vector3(data.x,data.y,data.z));
                            }
                        } else {
                            console.log('AI with id: ' + ai.id + ' has (' + ai.health + ') health left');
                        }
                    }
                    //lobby.despawnBullet(bullet);
                }
            });
            bullet.isDestroyed = true;                        
        });  
    }
    OnPlayerHit(data)
    {
        let lobby=this;
        lobby.connections.forEach(c => {
            let player = c.player;
            if(player.id==data.id)
            {
                player.dealDamage(20);
            }
        });
    }
    removePlayer(connection = Connection) {
        let lobby = this;

        connection.socket.broadcast.to(lobby.id).emit('disconnected', {
            id: connection.player.id
        });
    }
    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
}