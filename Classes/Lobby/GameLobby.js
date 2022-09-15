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
let ItemBase = require('../Items/ItemBase')
let Kaboom = require('../Items/Kaboom')
let InstaKill = require('../Items/InstaKill')
let Health = require('../Items/Health')

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
        this.maxZombies=Number(20);
        this.allZombiesRound=Number(6);
        this.roundComplete=false;
        this.nextRoundTimeCounter=Number(0);
        this.killAllZombiesTimer=Number(60);
        this.round=Number(1);
        this.zombies=Number(0);
        this.finishRound=false;
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
            lobby.updatePlayersHealth();
            let aiList = lobby.serverItems.filter(item => {return item instanceof AIBase;});
            aiList.forEach(ai => {
                let respawn=ai.onCanRespawn();
            });
        }
    }
    updateZombies(){      
        let lobby=this;
        let connections=lobby.connections;
        this.zombieSpawnTimeCounter+=0.1;
        //console.log(this.zombieSpawnTimeCounter);
        if(this.zombieSpawnTimeCounter>=3 && this.totalZombies<this.allZombiesRound && this.zombies<this.maxZombies){
            this.zombies+=1;
            this.totalZombies+=1;
            this.allZombiesSpawned+=1;
            this.zombieSpawnTimeCounter=0;
            console.log("currenttotalZombies: "+this.totalZombies+" allzombiesRound: "+this.allZombiesRound+" currentZombies: "+this.zombies)
            //console.log("Actual zombies: "+this.zombies+" Max zombies: "+this.maxZombies+" Round: "+this.round+" All zombies: "+this.allZombiesRound); 
            if(this.allZombiesSpawned>19)
            {
                this.maxZombiesReached=true;
            }
            this.onSpawnAIIntoGame();
        }
        else if(this.totalZombies==this.allZombiesRound)
        {
            this.roundComplete=true;
        }   
        
        if(this.totalZombies==this.allZombiesRound && this.zombies<3){
            this.killAllZombiesTimer-=0.1;
            if(this.killAllZombiesTimer<0){
                this.KillAllZombies();
                this.killAllZombiesTimer=60;
            }
        }
        
    }
    updateRound()
    {
        let lobby = this; 
        let connections=lobby.connections;
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
                if(this.finishRound==false){
                    this.finishRound=true;          
                    connections.forEach(p => {
                        let player = p.player;
                        var someone=player.checkAlive();
                        if(!someone)
                        {
                            console.log("respawn player");
                            player.respawn();
                            let returnData={
                                id:player.id,
                                username:player.username,
                                position: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            }
                            connections.forEach(connection => {
                                connection.socket.emit('playerRespawn',returnData);
                            });  
                        }
                    }); 
                    connections.forEach(connection =>{
                        connection.socket.emit('roundComplete');
                    });                              
                }
                this.nextRoundTimeCounter+=0.1;
                console.log("timer: "+this.nextRoundTimeCounter);
                if(this.nextRoundTimeCounter>=20){
                    this.round+=1;
                    this.roundComplete=false;
                    this.zombies=0;
                    this.totalZombies=0;
                    this.nextRoundTimeCounter=0;
                    this.allZombiesRound+=6;
                    this.finishRound=false;                              
                }
            }
        }
    }
    updateBullets() 
    {
        let lobby = this;
        let bullets = lobby.bullets;
        bullets.forEach(bullet => {
            let isDestroyed = bullet.onUpdate();

            if(isDestroyed) {           
                lobby.despawnBullet(bullet);
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
                if(item.username=="Kaboom"){
                    this.KillAllZombies();
                }
                else if(item.username=="Health"){
                    this.HealAllPlayers();
                }
                lobby.onServerUnspawn(item);     
            }
        });
    }
    updatePlayersHealth()
    {
        let lobby=this;
        let connections = lobby.connections;
        connections.forEach(p => {
            let player = p.player;
            if(player.health<100)
            {
                player.blood();
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
        if(this.lobbyUpdate){
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
        console.log("state: "+returnData.state+" players: "+returnData.players+" id: "+returnData.id)
        socket.emit('loadGame');
        socket.emit('lobbyUpdate',returnData);
        socket.broadcast.to(lobby.id).emit('lobbyUpdate',returnData);

        if(lobby.connections.length==1)
        {
            lobby.connections[0].socket.emit('host');
        }

        if(this.hostswap){
            this.hostswap=false;
            this.connections[this.currentHostNumber].socket.emit('disablehost');
            this.currentHostNumber++;
            if(this.currentHostNumber==lobby.connections.length){
                this.currentHostNumber=0;
            }
            this.connections[this.currentHostNumber].socket.emit('host');
        }
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
    onEndGame()
    {
        let lobby=this;
        let connection=this.connections[0];
        let socket=connection.socket;

        socket.emit('exitGame');
        socket.broadcast.to(lobby.id).emit('exitGame');
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
                        id: ai.id,
                        username:ai.username
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
        connection.socket.broadcast.to(lobby.id).emit('serverSpawn', returnData);
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
                if (ai.id==data.zombieID) {
                    let isDead = ai.dealDamage(data.damage);
                    if (isDead) {
                        console.log("Ai has died");
                        this.zombies-=1;
                        let returnData = {
                            id: ai.id,
                            username : ai.username
                        }
                        //Por el remoto caso de que el ultimo jugador se vaya pero la bala de a alguien mientras no hay nadie
                        lobby.connections[0].socket.emit('playerDied', returnData);
                        lobby.connections[0].socket.broadcast.to(lobby.id).emit('playerDied', returnData);
                        var randomNumber=lobby.getRandomInt(25);
                        if(randomNumber==4){
                            lobby.onServerSpawn(new MaxAmmo(),new Vector3(data.x,data.y,data.z));
                        }
                        else
                        {
                            randomNumber=lobby.getRandomInt(30);
                            if(randomNumber==4){
                                lobby.onServerSpawn(new Kaboom(),new Vector3(data.x,data.y,data.z));
                            }
                            else
                            {
                                randomNumber=lobby.getRandomInt(25);
                                if(randomNumber==4){
                                    lobby.onServerSpawn(new InstaKill(),new Vector3(data.x,data.y,data.z));
                                }
                                else
                                {
                                    randomNumber=lobby.getRandomInt(15);
                                    if(randomNumber==4){
                                        lobby.onServerSpawn(new Health(),new Vector3(data.x,data.y,data.z));
                                    }
                                }                              
                            }                             
                        }

                    } else {
                        console.log("AI with id: " +ai.id+ " has (" +ai.health+ ") health left");
                    }
                }
                //lobby.despawnBullet(bullet);    
            });
            bullet.isDestroyed = true;                        
        });  
    }
    OnPlayerHit(data)
    {
        let lobby=this;
        let connections = lobby.connections;
        var someoneDied=false;
        let returnData=undefined;

        lobby.connections.forEach(p => {
            let player = p.player;
            if(player.id==data.id)
            {
                var playerDead=player.dealDamage(20);
                if(playerDead){
                    someoneDied=true;
                    returnData={
                        id:player.id,
                        username:player.username 
                    }         
                }
            }
        });
        this.checkIfAllPlayersAreDead();    
        if(someoneDied){
            connections.forEach(connection => {
                connection.socket.emit('playerDied', returnData);
            });
        }
    }
    checkIfAllPlayersAreDead(){
        if(this.lobbyUpdate){
            let lobby=this;
            var someoneAlive=false;
            let connections = lobby.connections;
    
            lobby.connections.forEach(p => {
                let player = p.player;
                var someone=player.checkAlive();
                if(someone)
                    someoneAlive=true;
            });
            if(!someoneAlive){
                let returnData={
                    state:lobby.lobbyState.ENDGAME,
                    players:lobby.connections.length,
                    id:lobby.id
                };
                console.log("all dead");
                connections.forEach(connection => {
                    connection.socket.emit('lobbyUpdate', returnData);
                });
            }
        }
    }
    removePlayer(connection = Connection)
     {
        let lobby = this;

        connection.socket.broadcast.to(lobby.id).emit('disconnected', {
            id: connection.player.id
        });
    }
    getRandomInt(max) 
    {
        return Math.floor(Math.random() * max);
    }
    newHost()
    {
        if(this.hostswap==false){
            this.hostswap=true;
            console.log("swap host requested");
        }
    }
    KillAllZombies()
    {
        let lobby=this;
        let aiList = lobby.serverItems.filter(item => {return item instanceof AIBase;});
        aiList.forEach(ai => {
            let isKilled=ai.die();
            if(isKilled){
                this.zombies-=1;
                if(this.zombies<0){
                    //Por el remoto caso
                    this.zombies=0;
                }
            }
        });
    }
    HealAllPlayers()
    {
        let lobby=this;
        lobby.connections.forEach(p => {
            let player = p.player;
            player.maxHealth();
        });
    }
}