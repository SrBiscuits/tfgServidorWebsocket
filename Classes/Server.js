let Connection = require('./Connection')
let Player = require('./Player')

//Lobbies
let LobbyBase = require('./Lobby/LobbyBase')
let GameLobby = require('./Lobby/GameLobby')
let GameLobbySettings = require('./Lobby/GameLobbySettings')

module.exports = class Server {
    constructor() {
        this.connections = [];
        this.lobbys = [];

        this.generalServerID='General Server';
        this.startLobby=new LobbyBase();
        this.startLobby.id=this.generalServerID;
        this.lobbys[this.generalServerID]=this.startLobby;  
    }

    //Interval update every 100 miliseconds
    onUpdate() {
        let server = this;
        for(let id in server.lobbys) {
            server.lobbys[id].onUpdate();
        }
    }

    onConnected(socket) {
        let server = this;
        let connection = new Connection();
        connection.socket = socket;
        connection.player = new Player();
        connection.player.lobby=server.startLobby.id;
        connection.server = server;

        let player = connection.player;
        let lobbys = server.lobbys;

        console.log('Added new player to the server (' + player.id + ')');
        server.connections[player.id] = connection;

        socket.join(player.lobby);
        connection.lobby = lobbys[player.lobby];
        connection.lobby.onEnterLobby(connection);

        return connection;
    }

    onDisconnected(connection = Connection) {
        let server = this;
        let id = connection.player.id;
        
        delete server.connections[id];
        console.log('Player ' + connection.player.displayPlayerInformation() + ' has disconnected');

        connection.socket.broadcast.to(connection.player.lobby).emit('disconnected', {
            id: id
        });

        let currentLobbyIndex=connection.player.lobby;
        if(server.lobbys[currentLobbyIndex]!=undefined){
            server.lobbys[currentLobbyIndex].onLeaveLobby(connection);
            if (currentLobbyIndex != server.generalServerID){
                server.lobbys[currentLobbyIndex].checkIfAllPlayersAreDead();
            }
            if (currentLobbyIndex != server.generalServerID && server.lobbys[currentLobbyIndex]!=undefined && server.lobbys[currentLobbyIndex].connections.length == 0) 
            {
                console.log("Cerrando sala: "+currentLobbyIndex)
                delete server.lobbys[currentLobbyIndex];          
            }
        }
    }

    onStartLobby(id)
    {
        this.lobbys[id].onStartGame();
    }
    onEndLobby(id)
    {
        let server = this;
        console.log("Cerrando sala: "+id)
        this.lobbys[id].onEndGame();
        delete server.lobbys[id]; 
    }
    swapHost(id){
        this.lobbys[id].newHost();
    }
    onAttemptToJoinGame(connection = Connection) {
        let server = this;
        let lobbyFound = false;

        let gameLobbies =[];
        for(var id in server.lobbys){
            if(server.lobbys[id] instanceof GameLobby){
                gameLobbies.push(server.lobbys[id]);
            }
        }
        console.log('Encontradas (' + gameLobbies.length + ') lobbies en el servidor');

        gameLobbies.forEach(lobby => {
            if(!lobbyFound) {
                let canJoin = lobby.canEnterLobby(connection);

                if(canJoin) {
                    lobbyFound = true;
                    server.onSwitchLobby(connection, lobby.id);
                }
            }
        });

        if(!lobbyFound) {
            console.log('Haciendo nueva lobby');
            let gamelobby = new GameLobby(new GameLobbySettings('Zombies', 4));
            server.lobbys[gamelobby.id]=gamelobby;
            server.onSwitchLobby(connection, gamelobby.id);
        }
    }

    onSwitchLobby(connection = Connection, lobbyID) {
        let server = this;
        let lobbys = server.lobbys;

        connection.socket.join(lobbyID);
        connection.lobby = lobbys[lobbyID];

        lobbys[connection.player.lobby].onLeaveLobby(connection);
        lobbys[lobbyID].onEnterLobby(connection);
    }
}